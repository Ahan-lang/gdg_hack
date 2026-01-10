import { useState } from "react";

export default function CashRecommend() {
  const [cashAvailable, setCashAvailable] = useState("");
  const [isFestival, setIsFestival] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // --- LOGIC (STRICTLY UNCHANGED) ---
  const handleSubmit = async () => {
    if (!cashAvailable) {
      alert("Please enter available cash");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5000/recommend/cash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cashAvailable: Number(cashAvailable),
          isFestival
        })
      });

      const data = await res.json();
      console.log("CASH API RESULT:", data);
      setResult(data);
    } catch (err) {
      alert("Failed to get cash recommendation");
    } finally {
      setLoading(false);
    }
  };

  const totalSpent =
    result?.purchasePlan?.reduce((sum, item) => sum + item.cost, 0) || 0;

  // --- MODERN UI RENDER ---
  return (
    <div style={{ 
      paddingTop: "140px", // Prevents Navbar overlap
      paddingBottom: "80px",
      minHeight: "100vh",
      background: "linear-gradient(180deg, #fefce8 0%, #f0fdf4 100%)",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#166534", margin: 0 }}>
            💰 Cash Recommendation
          </h1>
          <p style={{ color: "#4b5563", marginTop: "10px", fontSize: "16px" }}>
            Optimize your spending based on available capital and seasonal trends.
          </p>
        </div>

        {/* INPUT CARD */}
        <div style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px)",
          padding: "30px",
          borderRadius: "24px",
          border: "1px solid rgba(250, 204, 21, 0.3)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
          marginBottom: "40px"
        }}>
          <div style={{ marginBottom: "25px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151" }}>
              Total Available Cash (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={cashAvailable}
              onChange={(e) => setCashAvailable(e.target.value)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontWeight: "600", color: "#374151" }}>
              <input
                type="checkbox"
                checked={isFestival}
                onChange={(e) => setIsFestival(e.target.checked)}
                style={{ width: "20px", height: "20px", accentColor: "#166534" }}
              />
              Festival Season Optimization
            </label>
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#166534",
              color: "white",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.1s active",
              boxShadow: "0 4px 6px -1px rgba(22, 101, 52, 0.2)"
            }}
          >
            {loading ? "Analyzing Financials..." : "Generate Purchase Plan"}
          </button>
        </div>

        {/* RESULT SECTION */}
        {result && (
          <div style={{ animation: "fadeIn 0.5s ease-in" }}>
            <h2 style={{ fontSize: "24px", color: "#166534", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              📊 Recommendation Result
            </h2>

            {/* Summary Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
              <div style={summaryBoxStyle("#f0fdf4", "#166534")}>
                <span style={{ fontSize: "14px", opacity: 0.8 }}>Total Recommended Spend</span>
                <div style={{ fontSize: "24px", fontWeight: "800" }}>₹{totalSpent}</div>
              </div>
              <div style={summaryBoxStyle("#fefce8", "#854d0e")}>
                <span style={{ fontSize: "14px", opacity: 0.8 }}>Remaining Balance</span>
                <div style={{ fontSize: "24px", fontWeight: "800" }}>₹{result.remainingCash}</div>
              </div>
            </div>

            {/* PURCHASE PLAN TABLE/LIST */}
            <h3 style={{ fontSize: "18px", color: "#374151", marginBottom: "15px" }}>🛒 Items to Buy</h3>
            {result.purchasePlan.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", background: "white", borderRadius: "16px", color: "#6b7280" }}>
                No purchases recommended for the current cash levels.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {result.purchasePlan.map((item) => (
                  <div key={item.itemId} style={{
                    padding: "20px",
                    background: "white",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}>
                    <div>
                      <strong style={{ fontSize: "18px", color: "#111827" }}>{item.item}</strong>
                      <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
                        Qty: <span style={{ color: "#059669", fontWeight: "700" }}>{item.buyQuantity}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827" }}>₹{item.cost}</div>
                      <div style={{ fontSize: "11px", color: "#9ca3af" }}>Remaining: ₹{item.remainingCash}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI EXPLANATION */}
            <div style={{
              marginTop: "40px",
              background: "#ECFEFF",
              padding: "25px",
              borderRadius: "20px",
              borderLeft: "6px solid #0891b2",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
            }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#164e63", display: "flex", alignItems: "center", gap: "8px" }}>
                🤖 AI Strategy
              </h3>
              <div style={{ 
                color: "#155e75", 
                lineHeight: "1.6", 
                whiteSpace: "pre-wrap",
                fontSize: "15px",
                fontStyle: "italic" 
              }}>
                {result.aiExplanation}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Summary Box Style
const summaryBoxStyle = (bgColor, textColor) => ({
  background: bgColor,
  color: textColor,
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  border: `1px solid ${textColor}20`
});