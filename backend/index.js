require("dotenv").config();
const mongoose = require('mongoose');
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// --- MIDDLEWARE ---
// --- MIDDLEWARE ---
app.use(cors({
  origin: "*", // Allows all origins for hackathon ease, or put your Vercel URL here
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// --- GEMINI AI CONFIGURATION ---
// Changed model to gemini-1.5-flash (the standard stable version)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🚀 MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- SCHEMAS ---
const itemSchema = new mongoose.Schema({
  name: String,
  stock: Number,
  unit_price: Number,
  selling_price: Number,
  category: String,
  unit: { type: String, default: "pcs" }
});
const Item = mongoose.model('Item', itemSchema);

const demandSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  quantity: Number,
  date: { type: Date, default: Date.now }
});
const Demand = mongoose.model('Demand', demandSchema);

// --- HELPER FUNCTIONS ---
function calculateAvgDailyDemand(weeklyHistory) {
  if (!weeklyHistory || weeklyHistory.length === 0) return 0;
  const totalQuantity = weeklyHistory.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
  // Returns average daily demand (Total / Number of records / 7 days)
  return (totalQuantity / weeklyHistory.length) / 7;
}

function detectIncreasingTrend(weeklyHistory) {
  if (!weeklyHistory || weeklyHistory.length < 3) return false;
  const recent = weeklyHistory.slice(-4);
  let increases = 0;
  for (let i = 1; i < recent.length; i++) {
    if (recent[i].quantity > recent[i - 1].quantity) increases++;
  }
  return increases >= 2;
}

function calculateMarginPercent(buyPrice, sellPrice) {
  if (!buyPrice || !sellPrice || buyPrice === 0) return 0;
  return (sellPrice - buyPrice) / sellPrice;
}

function calculateEffectiveDailyDemand({ avgDailyDemand, hasIncreasingTrend, marginPercent, isFestival }) {
  let effectiveDemand = avgDailyDemand;
  if (hasIncreasingTrend) effectiveDemand *= 1.20;
  if (marginPercent >= 0.30) effectiveDemand *= 1.10;
  if (isFestival) effectiveDemand *= 1.30;
  return effectiveDemand;
}

// --- ROUTES ---

// 1. Root Health Check
app.get("/", (req, res) => res.send("Inventory AI API is Live!"));

// 2. AI CONNECTION TEST
app.get("/test-ai", async (req, res) => {
  try {
    const result = await aiModel.generateContent("Say 'AI is working' in one sentence.");
    res.json({ message: "Gemini Connection Success", response: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: "Gemini Error", details: err.message });
  }
});

// 3. ITEM CRUD
app.get("/items", async (req, res) => {
  try {
    const allItems = await Item.find(); 
    res.json(allItems);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.post("/items", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Add failed" });
  }
});

app.put("/items/:id", async (req, res) => {
  try {
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
});

app.delete("/items/:id", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// 4. DEMAND TRACKING
// --- UPDATED DEMAND ROUTES ---

// A. FETCH HISTORY (For immediate display on selection)
app.get("/demand/:itemId", async (req, res) => {
  try {
    const history = await Demand.find({ itemId: req.params.itemId }).sort({ date: 1 });
    res.json(history.map((d, i) => ({ 
      _id: d._id, // Required for editing
      week: i + 1, 
      quantity: d.quantity 
    })));
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// B. LOG NEW DEMAND (With Negative Check)
app.post("/demand", async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    if (Number(quantity) < 0) return res.status(400).json({ error: "Demand cannot be negative" });

    const newEntry = new Demand({ itemId, quantity: Number(quantity) });
    await newEntry.save();
    
    // Return fresh history
    const history = await Demand.find({ itemId }).sort({ date: 1 });
    res.json(history.map((d, i) => ({ _id: d._id, week: i + 1, quantity: d.quantity })));
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// C. EDIT EXISTING DEMAND
app.put("/demand/:id", async (req, res) => {
  try {
    const { quantity, itemId } = req.body;
    if (Number(quantity) < 0) return res.status(400).json({ error: "Demand cannot be negative" });

    await Demand.findByIdAndUpdate(req.params.id, { quantity: Number(quantity) });
    
    // Return fresh history for the specific item
    const history = await Demand.find({ itemId }).sort({ date: 1 });
    res.json(history.map((d, i) => ({ _id: d._id, week: i + 1, quantity: d.quantity })));
  } catch (err) {
    res.status(500).json({ error: "Edit failed" });
  }
});

// 5. STOCK RECOMMENDATION
app.post("/recommend/stock", async (req, res) => {
  try {
    const { itemId, isFestival } = req.body;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const history = await Demand.find({ itemId }).sort({ date: 1 });
    const avgDailyDemand = calculateAvgDailyDemand(history);
    const hasIncreasingTrend = detectIncreasingTrend(history);
    const marginPercent = calculateMarginPercent(item.unit_price, item.selling_price);

    const effectiveDemand = calculateEffectiveDailyDemand({
      avgDailyDemand,
      hasIncreasingTrend,
      marginPercent,
      isFestival
    });

    const recommendedStock = Math.ceil(effectiveDemand * 30);
    const buyQuantity = Math.max(0, recommendedStock - item.stock);
    const status = recommendedStock > item.stock ? "Restock Needed" : "Healthy";

    const prompt = `Explain why stocking ${recommendedStock} units of ${item.name} is recommended. Current stock is ${item.stock}. Mention status is ${status}. Use 2 sentences.`;
    const result = await aiModel.generateContent(prompt);

    res.json({
      recommendedStock,
      currentStock: item.stock,
      buyQuantity,
      avgDailyDemand: avgDailyDemand.toFixed(2),
      status,
      aiExplanation: result.response.text()
    });
  } catch (err) {
    res.status(500).json({ error: "Stock Recommendation error" });
  }
});

// 6. CAPITAL OPTIMIZER (OPTIMIZE BUDGET)
app.post("/recommend/optimize-budget", async (req, res) => {
  try {
    const { budget, isFestival } = req.body;
    const allItems = await Item.find();
    let understockItems = [];

    for (const item of allItems) {
      const history = await Demand.find({ itemId: item._id }).sort({ date: 1 });
      const avgDailyDemand = calculateAvgDailyDemand(history);
      const hasIncreasingTrend = detectIncreasingTrend(history);
      const marginPercent = calculateMarginPercent(item.unit_price, item.selling_price);

      const effectiveDemand = calculateEffectiveDailyDemand({
        avgDailyDemand,
        hasIncreasingTrend,
        marginPercent,
        isFestival
      });

      const recommendedStockLevel = Math.ceil(effectiveDemand * 30);
      const needQty = recommendedStockLevel - item.stock;

      if (needQty > 0) {
        let priorityScore = effectiveDemand * (item.selling_price - item.unit_price);
        if (hasIncreasingTrend) priorityScore *= 1.2;

        understockItems.push({
          _id: item._id,
          name: item.name,
          unit_price: item.unit_price,
          needQty,
          priorityScore,
          currentStock: item.stock
        });
      }
    }

    understockItems.sort((a, b) => b.priorityScore - a.priorityScore);

    let remainingBudget = budget;
    let purchasePlan = [];
    let totalEstimatedCost = 0;

    for (const target of understockItems) {
      if (remainingBudget <= 0) break;
      const maxCanAfford = Math.floor(remainingBudget / target.unit_price);
      const buyQty = Math.min(target.needQty, maxCanAfford);

      if (buyQty > 0) {
        const cost = buyQty * target.unit_price;
        purchasePlan.push({
          itemId: target._id,
          name: target.name,
          quantity: buyQty,
          cost: cost,
          unitPrice: target.unit_price
        });
        remainingBudget -= cost;
        totalEstimatedCost += cost;
      }
    }

    let aiExplanation = "No plan generated.";
    if (purchasePlan.length > 0) {
      const prompt = `You are a professional inventory consultant. I have a budget of ₹${budget}. I am buying: ${purchasePlan.map(p => `${p.quantity} units of ${p.name}`).join(", ")}. Explain why this is smart for business profit in 3 sentences.`;
      const result = await aiModel.generateContent(prompt);
      aiExplanation = result.response.text();
    }

    res.json({
      plan: purchasePlan,
      totalCost: totalEstimatedCost,
      remainingBudget: remainingBudget.toFixed(2),
      aiExplanation
    });

  } catch (err) {
    console.error("Optimization Error:", err);
    res.status(500).json({ error: "Budget optimization failed" });
  }
});

// 7. ANALYTICS DASHBOARD
app.get("/analytics/dashboard", async (req, res) => {
  try {
    const allItems = await Item.find();
    const dashboardData = await Promise.all(allItems.map(async (item) => {
      const history = await Demand.find({ itemId: item._id }).sort({ date: 1 });
      const avgDemand = calculateAvgDailyDemand(history);
      
      let priceAction = "Maintain";
      let suggestedPrice = item.selling_price;
      let reason = "Stable demand observed.";

      if (detectIncreasingTrend(history)) {
        priceAction = "Increase";
        suggestedPrice = Math.round(item.selling_price * 1.15);
        reason = "Growing demand. Opportunity to optimize price.";
      } else if (item.stock > 50 && avgDemand < 0.5) {
        priceAction = "Decrease";
        suggestedPrice = Math.round(item.selling_price * 0.90);
        reason = "Slow movement. Consider discount to clear stock.";
      }

      return {
        _id: item._id,
        name: item.name,
        stock: item.stock,
        currentPrice: item.selling_price,
        suggestedPrice,
        priceAction,
        reason,
        avgDemand: avgDemand.toFixed(1),
        demandHistory: history.map((d, i) => ({ week: i + 1, quantity: d.quantity }))
      };
    }));

    res.json({
      bestPerformers: [...dashboardData].sort((a, b) => b.avgDemand - a.avgDemand).slice(0, 3),
      allData: dashboardData
    });
  } catch (err) {
    res.status(500).json({ error: "Dashboard failed" });
  }
});

// --- SERVER START ---
// --- SERVER START ---
// process.env.PORT is mandatory for Render deployment
const PORT = process.env.PORT || 5000; 

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});