import { useState } from "react";

export default function CashRecommend() {
  const [budget, setBudget] = useState("");
  const [isFestival, setIsFestival] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOptimize = async () => {
    if (!budget || budget <= 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // UPDATED URL
      const res = await fetch("https://gdg-hack.onrender.com/recommend/optimize-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: Number(budget), isFestival }),
      });

      if (!res.ok) {
        throw new Error(`Server Error: ${res.status}. Check if backend is running.`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Optimization error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "80px 20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#0f172a" }}>
      <header style={{ marginBottom: "40px", borderBottom: "1px solid #e2e8f0", paddingBottom: "20px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#1e293b", margin: 0, letterSpacing: "-0.02em" }}>Capital Optimizer</h2>
        <p style={{ color: "#64748b", fontSize: "16px", marginTop: "4px" }}>Prioritize inventory investment based on demand, margin, and current trends.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "40px", alignItems: "start" }}>
        
        {/* Input Card */}
        <div style={{ background: "#ffffff", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "700", fontSize: "13px", color: "#475569", textTransform: "uppercase" }}>Available Capital (₹)</label>
            <input 
              type="number" 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Enter amount"
              style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "18px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#f8fafc", borderRadius: "10px" }}>
            <input 
              type="checkbox" 
              id="fest_mode"
              checked={isFestival} 
              onChange={(e) => setIsFestival(e.target.checked)} 
              style={{ width: "18px", height: "18px", accentColor: "#0f172a", cursor: "pointer" }}
            />
            <label htmlFor="fest_mode" style={{ fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>Factor in Festival Spikes</label>
          </div>

          <button 
            onClick={handleOptimize}
            disabled={loading || !budget}
            style={{ 
              width: "100%", padding: "16px", background: "#0f172a", 
              color: "white", borderRadius: "10px", fontWeight: "700", border: "none", 
              fontSize: "16px", cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.2s" 
            }}
          >
            {loading ? "Analyzing Data..." : "Generate Purchase Plan"}
          </button>
        </div>

        {/* Output Section */}
        <div>
          {error && (
            <div style={{ padding: "20px", background: "#fef2f2", color: "#b91c1c", borderRadius: "12px", border: "1px solid #fee2e2", marginBottom: "20px" }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {!result && !loading && !error && (
            <div style={{ padding: "60px", textAlign: "center", border: "2px dashed #e2e8f0", borderRadius: "20px", color: "#94a3b8" }}>
              <p>Enter your budget to see optimized procurement suggestions.</p>
            </div>
          )}

          {loading && (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div className="spinner" style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #0f172a", borderRadius: "50%", width: "40px", height: "40px", margin: "0 auto 20px auto", animation: "spin 1s linear infinite" }}></div>
              <p style={{ color: "#64748b", fontWeight: "600" }}>Gemini AI is calculating your optimal strategy...</p>
            </div>
          )}

          {result && (
            <div style={{ animation: "fadeIn 0.4s ease-out" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div style={{ padding: "20px", background: "#f1f5f9", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Total Outlay</span>
                  <div style={{ fontSize: "24px", fontWeight: "800" }}>₹{result.totalCost}</div>
                </div>
                <div style={{ padding: "20px", background: "#f1f5f9", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Unused Budget</span>
                  <div style={{ fontSize: "24px", fontWeight: "800" }}>₹{result.remainingBudget}</div>
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: "24px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#f8fafc" }}>
                    <tr>
                      <th style={{ textAlign: "left", padding: "14px 20px", fontSize: "12px", color: "#64748b" }}>PRODUCT</th>
                      <th style={{ textAlign: "center", padding: "14px 20px", fontSize: "12px", color: "#64748b" }}>QUANTITY</th>
                      <th style={{ textAlign: "right", padding: "14px 20px", fontSize: "12px", color: "#64748b" }}>ALLOCATION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.plan.map((item, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "16px 20px", fontWeight: "700" }}>{item.name}</td>
                        <td style={{ padding: "16px 20px", textAlign: "center" }}>
                          <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                            {item.quantity} units
                          </span>
                        </td>
                        <td style={{ padding: "16px 20px", textAlign: "right", fontWeight: "800", color: "#0f172a" }}>₹{item.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {result.aiExplanation && (
                <div style={{ padding: "24px", background: "#f8fafc", borderRadius: "16px", borderLeft: "4px solid #0f172a" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "18px" }}>💡</span>
                    <strong style={{ fontSize: "14px", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Expert Strategy</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.6", color: "#475569", fontStyle: "italic" }}>
                    "{result.aiExplanation}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}