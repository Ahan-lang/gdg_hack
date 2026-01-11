import { useState, useEffect } from "react";

export default function Recommend() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [isFestival, setIsFestival] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/items")
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, []);

  const handleGetRecommendation = async () => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/recommend/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: selectedItem, isFestival }),
      });
      const data = await res.json();
      setRecommendation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "80px 20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1f2937" }}>
      <header style={{ marginBottom: "48px", textAlign: "left" }}>
        <h2 style={{ fontSize: "42px", fontWeight: "800", color: "#111827", letterSpacing: "-0.03em", margin: "0" }}>Inventory Intelligence</h2>
        <p style={{ color: "#6b7280", marginTop: "8px", fontSize: "18px" }}>Predict demand and optimize your stock levels with Gemini AI.</p>
      </header>
      
      <div style={{ display: "grid", gridTemplateColumns: recommendation ? "350px 1fr" : "1fr", gap: "32px", alignItems: "start" }}>
        
        {/* Input Section */}
        <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "1px solid #f3f4f6", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "14px", color: "#4b5563", textTransform: "uppercase" }}>Target Product</label>
            <select 
              value={selectedItem} 
              onChange={(e) => setSelectedItem(e.target.value)}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "16px", backgroundColor: "#f9fafb", cursor: "pointer" }}
            >
              <option value="">Select an item...</option>
              {items.map((item) => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f3f4f6", borderRadius: "12px" }}>
            <label htmlFor="fest" style={{ fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Festival Spike?</label>
            <input 
              type="checkbox" 
              id="fest"
              checked={isFestival} 
              onChange={(e) => setIsFestival(e.target.checked)} 
              style={{ width: "20px", height: "20px", accentColor: "#166534", cursor: "pointer" }}
            />
          </div>

          <button 
            onClick={handleGetRecommendation}
            disabled={loading || !selectedItem}
            style={{ 
              width: "100%", padding: "16px", background: "#111827", 
              color: "white", borderRadius: "12px", fontWeight: "700", border: "none", 
              fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", transition: "transform 0.2s, background 0.2s" 
            }}
            onMouseOver={(e) => e.target.style.background = "#1f2937"}
            onMouseOut={(e) => e.target.style.background = "#111827"}
          >
            {loading ? "Processing..." : "Generate Analysis"}
          </button>
        </div>

        {/* Results Section */}
        {recommendation && (
          <div style={{ animation: "fadeIn 0.6s ease-out" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ padding: "24px", background: "white", borderRadius: "20px", border: "1px solid #e5e7eb" }}>
                <p style={{ fontSize: "12px", color: "#6b7280", fontWeight: "700", textTransform: "uppercase", marginBottom: "12px" }}>Daily Demand</p>
                <div style={{ fontSize: "28px", fontWeight: "800" }}>{recommendation.avgDailyDemand} <span style={{fontSize: "16px", fontWeight: "500", color: "#9ca3af"}}>u/day</span></div>
              </div>
              
              <div style={{ padding: "24px", background: recommendation.status === "Healthy" ? "#f0fdf4" : "#fef2f2", borderRadius: "20px", border: recommendation.status === "Healthy" ? "1px solid #bbf7d0" : "1px solid #fecaca" }}>
                <p style={{ fontSize: "12px", color: recommendation.status === "Healthy" ? "#166534" : "#991b1b", fontWeight: "700", textTransform: "uppercase", marginBottom: "12px" }}>Status</p>
                <div style={{ fontSize: "22px", fontWeight: "800", color: recommendation.status === "Healthy" ? "#166534" : "#991b1b" }}>{recommendation.status}</div>
              </div>
            </div>

            <div style={{ padding: "32px", background: "#111827", borderRadius: "24px", color: "white", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "13px", opacity: 0.6, fontWeight: "600", textTransform: "uppercase" }}>Recommended Procurement</p>
                <h3 style={{ fontSize: "40px", margin: "4px 0 0 0", fontWeight: "800" }}>+ {recommendation.buyQuantity} <span style={{fontSize: "20px", opacity: 0.6}}>units</span></h3>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "13px", opacity: 0.6, fontWeight: "600", textTransform: "uppercase" }}>Target Level</p>
                <div style={{ fontSize: "20px", fontWeight: "700" }}>{recommendation.recommendedStock} Total</div>
              </div>
            </div>

            {recommendation.aiExplanation && (
              <div style={{ padding: "24px", background: "#f8fafc", borderRadius: "20px", border: "1px solid #e2e8f0", position: "relative" }}>
                <div style={{ position: "absolute", top: "-12px", left: "24px", background: "#166534", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800" }}>
                  GEMINI AI INSIGHT
                </div>
                <p style={{ margin: "8px 0 0 0", color: "#334155", lineHeight: "1.6", fontSize: "15px", fontWeight: "500" }}>
                  "{recommendation.aiExplanation}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}