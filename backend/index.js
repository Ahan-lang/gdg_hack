require("dotenv").config();
const mongoose = require('mongoose');
const express = require("express");
const cors = require("cors");

const app = express();

// --------------------
// DEPLOYMENT SETTINGS
// --------------------
// Allow all origins for prototype deployment so your frontend can connect easily
app.use(cors());
app.use(express.json());

// --------------------
// DATABASE CONNECTION
// --------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🚀 MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --------------------
// SCHEMAS
// --------------------
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

// --------------------
// HELPER FUNCTIONS
// --------------------
function calculateAvgDailyDemand(weeklyHistory) {
  if (!weeklyHistory || weeklyHistory.length === 0) return 0;
  const totalQuantity = weeklyHistory.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
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

// --------------------
// ROUTES
// --------------------

// Root Route for Health Check
app.get("/", (req, res) => res.send("Inventory AI API is Live!"));

// 1. ITEM CRUD
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

// 2. DEMAND TRACKING
app.post("/demand", async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const newEntry = new Demand({ itemId, quantity: Number(quantity) });
    await newEntry.save();
    const history = await Demand.find({ itemId }).sort({ date: 1 });
    res.json(history.map((d, i) => ({ week: i + 1, quantity: d.quantity })));
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.get("/demand/:itemId", async (req, res) => {
  try {
    const history = await Demand.find({ itemId: req.params.itemId }).sort({ date: 1 });
    res.json(history.map((d, i) => ({ week: i + 1, quantity: d.quantity })));
  } catch (err) {
    res.status(500).json({ error: "History failed" });
  }
});

// 3. AI RECOMMENDATION
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

    res.json({
      recommendedStock,
      avgDailyDemand: avgDailyDemand.toFixed(2),
      status: recommendedStock > item.stock ? "Restock Needed" : "Healthy"
    });
  } catch (err) {
    res.status(500).json({ error: "Recommendation error" });
  }
});

// 4. ANALYTICS DASHBOARD (Completed Missing Logic)
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

// --------------------
// SERVER START
// --------------------
// '0.0.0.0' is required for Render to bind correctly to the external network
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});