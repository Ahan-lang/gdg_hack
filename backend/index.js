require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getGeminiModel } = require("./ai/gemini");

const app = express();
app.use(cors());
app.use(express.json());

// --------------------
// IN-MEMORY STORAGE
// --------------------
let items = [];
let demand = {};

// Helper Functions
function calculateAvgDailyDemand(weeklyDemand) {
  if (!weeklyDemand || weeklyDemand.length === 0) return 0;
  const totalWeekly = weeklyDemand.reduce(
    (sum, w) => sum + Number(w.quantity || 0),
    0
  );
  const avgWeekly = totalWeekly / weeklyDemand.length;
  return avgWeekly / 7;
}

function detectIncreasingTrend(weeklyDemand) {
  if (!weeklyDemand || weeklyDemand.length < 4) return false;
  const recent = weeklyDemand.slice(-8);
  let increases = 0;
  for (let i = 1; i < recent.length; i++) {
    if (recent[i].quantity > recent[i - 1].quantity) {
      increases++;
    }
  }
  return increases >= 6;
}

function calculateMarginPercent(buyPrice, sellPrice) {
  if (!buyPrice || !sellPrice || buyPrice === 0) return 0;
  return (sellPrice - buyPrice) / sellPrice;
}

function calculateEffectiveDailyDemand({
  avgDailyDemand,
  hasIncreasingTrend,
  marginPercent,
  isFestival
}) {
  let effectiveDemand = avgDailyDemand;
  if (hasIncreasingTrend) effectiveDemand *= 1.15;
  if (marginPercent >= 0.45) {
    effectiveDemand *= 1.15;
  } else if (marginPercent >= 0.30) {
    effectiveDemand *= 1.10;
  }
  if (isFestival) effectiveDemand *= 1.25;
  return effectiveDemand;
}

// Debug logger
setInterval(() => {
  console.log("DEMAND STATE:", JSON.stringify(demand, null, 2));
}, 5000);

// --------------------
// HEALTH CHECK
// --------------------
app.get("/", (req, res) => {
  res.send("API running");
});

// --------------------
// ITEM ROUTES (UNCHANGED)
// --------------------
app.get("/items", (req, res) => {
  res.json(items);
});

app.post("/items", (req, res) => {
  const { name, stock, category, unit_price, unit } = req.body;
  if (!name || stock == null) {
    return res.status(400).json({ error: "name and stock required" });
  }
  const newItem = {
    id: Date.now(),
    name,
    stock: Number(stock),
    category: category || "general",
    unit_price: Number(unit_price || 0),
    unit: unit || "pcs",
    createdAt: new Date().toISOString()
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

app.put("/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = items.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  const { name, stock, category, unit_price, unit } = req.body;
  if (name !== undefined) item.name = name;
  if (stock !== undefined) item.stock = Number(stock);
  if (category !== undefined) item.category = category;
  if (unit_price !== undefined) item.unit_price = Number(unit_price);
  if (unit !== undefined) item.unit = unit;
  res.json(item);
});

app.delete("/items/:id", (req, res) => {
  const id = Number(req.params.id);
  items = items.filter(i => i.id !== id);
  res.json({ success: true });
});

// --------------------
// DEMAND ROUTES (UNCHANGED)
// --------------------
app.get("/demand/:itemId", (req, res) => {
  const itemId = Number(req.params.itemId);
  res.json(demand[itemId] || []);
});

app.post("/demand", (req, res) => {
  const { itemId, quantity } = req.body;
  if (!itemId || quantity == null) return res.status(400).json({ error: "Invalid data" });
  const itemExists = items.some(i => i.id === itemId);
  if (!itemExists) return res.status(404).json({ error: "Item not found" });
  if (!demand[itemId]) demand[itemId] = [];
  demand[itemId].push({ week: demand[itemId].length + 1, quantity: Number(quantity) });
  if (demand[itemId].length > 12) {
    demand[itemId].shift();
    demand[itemId] = demand[itemId].map((d, i) => ({ week: i + 1, quantity: d.quantity }));
  }
  res.json(demand[itemId]);
});

app.put("/demand", (req, res) => {
  const { itemId, week, quantity } = req.body;
  if (!itemId || !week || quantity == null) return res.status(400).json({ error: "Invalid data" });
  const list = demand[itemId];
  if (!list) return res.status(404).json({ error: "Demand not found" });
  const entry = list.find(d => d.week === week);
  if (!entry) return res.status(404).json({ error: "Week not found" });
  entry.quantity = Number(quantity);
  res.json(list);
});

// --------------------
// SEED ITEMS
// --------------------
items.push(
  { id: 101, name: "Keyboard", stock: 2, category: "Tech", unit_price: 50, unit: "pcs", createdAt: new Date().toISOString() },
  { id: 102, name: "Monitor", stock: 1, category: "Tech", unit_price: 200, unit: "pcs", createdAt: new Date().toISOString() }
);

app.get("/ping-demand", (req, res) => {
  res.json({ ok: true });
});

// --------------------
// GEMINI TEST ROUTE
// --------------------
app.get("/ai/test", async (req, res) => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent("Say exactly: Gemini backend is working");
    res.json({ success: true, reply: result.response.text() });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --------------------
// STOCK RECOMMENDATION (FIXED LOGIC)
// --------------------
app.post("/recommend/stock", async (req, res) => {
  try {
    const { itemId, sellingPrice, isFestival } = req.body;

    const item = items.find(i => i.id === Number(itemId));
    if (!item) return res.status(404).json({ error: "Item not found" });

    const weeklyDemand = demand[itemId] || [];
    
    // 1. Logic Calculations
    const avgDailyDemand = calculateAvgDailyDemand(weeklyDemand);
    const hasIncreasingTrend = detectIncreasingTrend(weeklyDemand);
    const marginPercent = calculateMarginPercent(item.unit_price, Number(sellingPrice));

    // 2. Effective Demand & Recommended Stock
    const effectiveDailyDemand = calculateEffectiveDailyDemand({
      avgDailyDemand,
      hasIncreasingTrend,
      marginPercent,
      isFestival
    });

    const BUFFER_DAYS = 14;
    const recommendedStock = Math.ceil(effectiveDailyDemand * BUFFER_DAYS);
    const buyQuantity = Math.max(recommendedStock - item.stock, 0);
    const shouldBuy = buyQuantity > 0;

    // 3. Profit Estimation (using unit_price)
    const expectedProfit = buyQuantity * (Number(sellingPrice) - item.unit_price);
   
    // 4. AI Explanation (Gemini)
let aiExplanation = "AI explanation not available";

try {
  const model = getGeminiModel();

  const prompt = `
You are a retail inventory advisor.

Explain the stock recommendation clearly in simple business language.

Details:
- Item name: ${item.name}
- Current stock: ${item.stock}
- Average daily demand: ${avgDailyDemand.toFixed(2)}
- Increasing demand trend: ${hasIncreasingTrend ? "Yes" : "No"}
- Festival period: ${isFestival ? "Yes" : "No"}
- Profit margin: ${(marginPercent * 100).toFixed(1)}%
- Recommended stock level: ${recommendedStock}
- Expected profit: ${expectedProfit.toFixed(2)}

Explain:
1. Why this stock level is recommended
2. How demand trend and festival affected it
3. How profit margin influenced the decision

Keep it short and practical.
`;

  const result = await model.generateContent(prompt);
  aiExplanation = result.response.text();

} catch (aiError) {
  console.error("AI explanation error:", aiError.message);
}

    res.json({
  item: item.name,
  currentStock: item.stock,
  avgDailyDemand: avgDailyDemand.toFixed(2),
  bufferDays: BUFFER_DAYS,
  recommendedStock,
  shouldBuy,
  buyQuantity,
  marginPercent: (marginPercent * 100).toFixed(1) + "%",
  hasIncreasingTrend,
  isFestival: !!isFestival,
  expectedProfit: Number(expectedProfit.toFixed(2)),
  aiExplanation
});


  } 
  catch (err) {
  console.error("STOCK AI ERROR 👉", err);
  res.status(500).json({
    error: "Stock recommendation failed",
    details: err.message || err
  });
}
});


app.post("/recommend/cash", async (req, res) => {
  try {
    const { cashAvailable, isFestival } = req.body;
    let remainingCash = Number(cashAvailable);

    if (!remainingCash || remainingCash <= 0) {
      return res.status(400).json({ error: "Invalid cash amount" });
    }

    const recommendations = [];

    for (const item of items) {
      const weeklyDemand = demand[item.id] || [];

      const avgDailyDemand = calculateAvgDailyDemand(weeklyDemand);
      if (avgDailyDemand === 0) continue;

      const hasIncreasingTrend = detectIncreasingTrend(weeklyDemand);

      const effectiveDailyDemand = calculateEffectiveDailyDemand({
        avgDailyDemand,
        hasIncreasingTrend,
        marginPercent: 0, // ignored safely
        isFestival
      });

      const BUFFER_DAYS = 14;
      const recommendedStock = Math.ceil(effectiveDailyDemand * BUFFER_DAYS);
      const buyQuantity = Math.max(recommendedStock - item.stock, 0);

      if (buyQuantity <= 0) continue;

      const cost = buyQuantity * item.unit_price;

      const priorityScore =
        effectiveDailyDemand *
        BUFFER_DAYS *
        (hasIncreasingTrend ? 1.3 : 1) *
        (isFestival ? 1.25 : 1);

      recommendations.push({
        itemId: item.id,
        item: item.name,
        buyQuantity,
        cost,
        priorityScore
      });
    }

    // Sort by urgency
    recommendations.sort((a, b) => b.priorityScore - a.priorityScore);

    const finalPlan = [];

    for (const rec of recommendations) {
      if (remainingCash <= 0) break;

      if (rec.cost <= remainingCash) {
        remainingCash -= rec.cost;
        finalPlan.push({
          itemId: rec.itemId,
          item: rec.item,
          buyQuantity: rec.buyQuantity,
          cost: rec.cost,
          remainingCash
        });
      }
    }

    // Gemini explanation (NO pricing assumptions)
    let aiExplanation = "AI explanation not available";
    try {
      const model = getGeminiModel();

      const prompt = `
You are a retail inventory advisor.

The shopkeeper has limited cash and wants to restock wisely.

Festival period: ${isFestival ? "Yes" : "No"}

Purchases made:
${finalPlan
  .map(p => `- ${p.item}: Buy ${p.buyQuantity}, Cost ${p.cost}`)
  .join("\n")}

Explain why these items were prioritized based on demand trends, urgency, and seasonality.
Avoid mentioning selling price or profit.
Keep it clear and simple.
`;

      const result = await model.generateContent(prompt);
      aiExplanation = result.response.text();
    } catch (aiErr) {
      console.error("AI explanation error:", aiErr.message);
    }

    res.json({
      cashAvailable,
      remainingCash,
      purchasePlan: finalPlan,
      aiExplanation
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cash recommendation failed" });
  }
});



app.post("/ai/stock-recommendation", async (req, res) => {
  res.json({
    success: true,
    message: "Stock recommendation route ready",
    receivedData: req.body
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});