import { useEffect, useState } from "react";

export default function Recommend() {
  const [items, setItems] = useState([]);
  const [itemId, setItemId] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [isFestival, setIsFestival] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // --------------------
  // Load items (LOGIC UNCHANGED)
  // --------------------
  useEffect(() => {
    fetch("http://localhost:5000/items")
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(() => alert("Failed to load items"));
  }, []);

  // --------------------
  // Submit recommendation request (LOGIC UNCHANGED)
  // --------------------
  const getRecommendation = async () => {
    if (!itemId || !sellingPrice) {
      alert("Select item and enter selling price");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5000/recommend/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: Number(itemId),
          sellingPrice: Number(sellingPrice),
          isFestival
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Recommendation failed");
    } finally {
      setLoading(false);
    }
  };

  // --------------------
  // UI RENDER
  // --------------------
  return (
    <div style={{ 
      paddingTop: "140px", 
      paddingBottom: "80px",
      minHeight: "100vh",
      background: "linear-gradient(180deg, #fefce8 0%, #f0fdf4 100%)",
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* Page Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#166534", margin: 0 }}>
            📦 AI Stock Recommendation
          </h2>
          <p style={{ color: "#4b5563", marginTop: "10px" }}>
            Smart analysis to help you decide when and what to restock.
          </p>
        </div>

        {/* Input Card */}
        <div style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px)",
          padding: "30px",
          borderRadius: "24px",
          border: "1px solid rgba(250, 204, 21, 0.3)",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            {/* ITEM SELECT */}
            <div>
              <label style={labelStyle}>Inventory Item</label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select Item</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SELLING PRICE */}
            <div>
              <label style={labelStyle}>Selling Price (₹)</label>
              <input
                type="number"
                value={sellingPrice}
                placeholder="0.00"
                onChange={(e) => setSellingPrice(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* FESTIVAL CHECKBOX */}
          <div style={{ marginBottom: "25px", display: "flex", alignItems: "center" }}>
            <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", color: "#374151", fontWeight: "600" }}>
              <input
                type="checkbox"
                checked={isFestival}
                onChange={(e) => setIsFestival(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#166534" }}
              />
              Festival Season Optimization
            </label>
          </div>

          <button 
            onClick={getRecommendation}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#166534",
              color: "white",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.2s",
              boxShadow: "0 4px 12px rgba(22, 101, 52, 0.2)"
            }}
          >
            {loading ? "Crunching Numbers..." : "Get AI Recommendation"}
          </button>
        </div>

        {/* RESULT SECTION */}
        {result && (
          <div style={{
            marginTop: "30px",
            padding: "30px",
            background: "white",
            borderRadius: "24px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "#111827" }}>Analysis Results</h3>
              <div style={{
                padding: "8px 16px",
                borderRadius: "20px",
                backgroundColor: result.shouldBuy ? "#dcfce7" : "#fee2e2",
                color: result.shouldBuy ? "#166534" : "#991b1b",
                fontWeight: "800",
                fontSize: "14px"
              }}>
                {result.shouldBuy ? "✅ BUY RECOMMENDED" : "❌ DO NOT BUY"}
              </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <DataBox label="Current Stock" value={result.currentStock} />
              <DataBox label="Recommended Stock" value={result.recommendedStock} />
              <DataBox label="Avg Daily Demand" value={result.avgDailyDemand} />
              <DataBox label="Buy Quantity" value={result.buyQuantity} />
            </div>

            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f9fafb", borderRadius: "12px" }}>
              <div style={resultRow}>
                <span>Increasing Demand Trend:</span>
                <span style={{ fontWeight: "700" }}>{result.hasIncreasingTrend ? "Yes" : "No"}</span>
              </div>
              <div style={resultRow}>
                <span>Expected Profit:</span>
                <span style={{ fontWeight: "700", color: "#059669" }}>₹{result.expectedProfit}</span>
              </div>
            </div>

            {/* AI EXPLANATION */}
            {result?.aiExplanation && (
              <div style={{
                marginTop: "24px",
                padding: "20px",
                borderRadius: "16px",
                background: "#f5f3ff",
                borderLeft: "6px solid #7c3aed"
              }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#4c1d95", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                  🤖 AI Insight
                </h3>
                <p style={{
                  color: "#374151",
                  lineHeight: "1.6",
                  whiteSpace: "pre-line",
                  margin: 0
                }}>
                  {result.aiExplanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components/Styles
const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
  outline: "none",
  backgroundColor: "white",
  boxSizing: "border-box"
};

const resultRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  fontSize: "14px",
  color: "#4b5563"
};

function DataBox({ label, value }) {
  return (
    <div style={{ padding: "12px", border: "1px solid #f1f5f9", borderRadius: "10px", textAlign: "center" }}>
      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>{value}</div>
    </div>
  );
}