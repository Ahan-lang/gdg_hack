require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Gemini init
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🔍 sanity check
console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);

// --------------------
// IN-MEMORY STORAGE
// --------------------
let items = [];
let demand = {};

// Debug logger (KEEP THIS)
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
// DEMAND ROUTES (FIXED)
// --------------------

// GET demand for an item
app.get("/demand/:itemId", (req, res) => {
  const itemId = Number(req.params.itemId);
  res.json(demand[itemId] || []);
});

// ADD demand (new week)
app.post("/demand", (req, res) => {
  const { itemId, quantity } = req.body;

  if (!itemId || quantity == null) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const itemExists = items.some(i => i.id === itemId);
  if (!itemExists) {
    return res.status(404).json({ error: "Item not found" });
  }

  if (!demand[itemId]) {
    demand[itemId] = [];
  }

  // Add new week
  demand[itemId].push({
    week: demand[itemId].length + 1,
    quantity: Number(quantity)
  });

  // Enforce 12-week rolling window
  if (demand[itemId].length > 12) {
    demand[itemId].shift(); // remove oldest
    // re-number weeks
    demand[itemId] = demand[itemId].map((d, i) => ({
      week: i + 1,
      quantity: d.quantity
    }));
  }

  res.json(demand[itemId]);
});

// EDIT demand (existing week)
app.put("/demand", (req, res) => {
  const { itemId, week, quantity } = req.body;

  if (!itemId || !week || quantity == null) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const list = demand[itemId];
  if (!list) {
    return res.status(404).json({ error: "Demand not found" });
  }

  const entry = list.find(d => d.week === week);
  if (!entry) {
    return res.status(404).json({ error: "Week not found" });
  }

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

// --------------------
app.get("/ping-demand", (req, res) => {
  res.json({ ok: true });
});
// --------------------
// GEMINI TEST ROUTE
// --------------------

app.get("/ai/test", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-pro"
    });

    const result = await model.generateContent(
      "Say exactly: Gemini backend is working"
    );

    res.json({
      success: true,
      reply: result.response.text()
    });
  } catch (error) {
    console.error("Gemini error FULL:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});





const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
