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
    <div style={{ padding: "120px 20px", maxWidth: "800px", margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#166534" }}>Stock Predictor</h2>
      
      <div style={{ background: "white", padding: "30px", borderRadius: "20px", border: "1px solid #e5e7eb", marginTop: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>Select Item</label>
          <select 
            value={selectedItem} 
            onChange={(e) => setSelectedItem(e.target.value)}
            style={{ width: "100%", padding: "12px", borderRadius: "10px" }}
          >
            <option value="">Choose item...</option>
            {items.map((item) => (
              <option key={item._id} value={item._id}>{item.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <input type="checkbox" checked={isFestival} onChange={(e) => setIsFestival(e.target.checked)} />
          <label>Festival approaching?</label>
        </div>

        <button 
          onClick={handleGetRecommendation}
          style={{ width: "100%", padding: "15px", background: "#166534", color: "white", borderRadius: "10px", fontWeight: "bold", border: "none" }}
        >
          {loading ? "Analyzing..." : "Get AI Recommendation"}
        </button>

        {recommendation && (
          <div style={{ marginTop: "30px", padding: "20px", background: "#f0fdf4", borderRadius: "15px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <p>Avg Demand:</p>
                <strong>{recommendation.avgDailyDemand} units/day</strong>
              </div>
              <div>
                <p>Recommended Stock:</p>
                <strong>{recommendation.recommendedStock} units</strong>
              </div>
            </div>
            <p style={{ marginTop: "10px" }}>Status: <strong>{recommendation.status}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}