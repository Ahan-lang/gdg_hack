import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis } from "recharts";

export default function AnalyticsDashboard() {
  const [data, setData] = useState({ bestPerformers: [], worstPerformers: [], allData: [] });
  const [loading, setLoading] = useState(true);

  // --------------------
  // FETCH ANALYTICS (Updated to Live Backend)
  // --------------------
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // UPDATED URL FROM localhost:5000 TO GDG-HACK.ONRENDER.COM
        const res = await fetch("https://gdg-hack.onrender.com/analytics/dashboard");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        
        setData({
          bestPerformers: json.bestPerformers || [],
          worstPerformers: json.worstPerformers || [],
          allData: json.allData || []
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div style={loaderStyle}>✨ Refining Insights...</div>;

  return (
    <div style={{ marginTop: "40px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* --- TOP PERFORMANCE CARDS --- */}
      <h3 style={{ color: "#1a202c", marginBottom: "20px", fontSize: "22px", fontWeight: "800" }}>
        Weekly Performance Highlights
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px", marginBottom: "50px" }}>
        {data.bestPerformers?.map((item) => (
          <div key={item._id || item.id} style={heroCardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <span style={badgeStyle}>Best Performer</span>
              <span style={{ fontSize: "14px", color: "#718096", fontWeight: "600" }}>
                ID: #{(item._id || item.id)?.toString().slice(-4)}
              </span>
            </div>
            <h2 style={{ margin: "0", fontSize: "26px", color: "#1a202c" }}>{item.name}</h2>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "10px" }}>
              <span style={{ fontSize: "32px", fontWeight: "800", color: "#2f855a" }}>{item.avgDemand}</span>
              <span style={{ color: "#718096", fontSize: "14px" }}>Avg daily sales</span>
            </div>
            
            <div style={{ height: "80px", marginTop: "20px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={item.demandHistory || []}>
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    labelFormatter={(value) => `Week ${value + 1}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="quantity" 
                    stroke="#2f855a" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#2f855a" }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* --- SMART PRICING STRATEGY TABLE --- */}
      <div style={tableContainerStyle}>
        <div style={{ padding: "25px", borderBottom: "1px solid #edf2f7", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: "#2d3748", fontSize: "20px" }}>Inventory Intelligence</h3>
            <p style={{ margin: "5px 0 0 0", color: "#718096", fontSize: "14px" }}>Automated suggestions based on sales trends.</p>
          </div>
          <div style={{ fontSize: '12px', color: '#718096', fontWeight: '600' }}>
            TOTAL ITEMS ANALYZED: {data.allData?.length || 0}
          </div>
        </div>
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f8fafc" }}>
            <tr>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Sales Trend</th>
              <th style={thStyle}>Current Price</th>
              <th style={thStyle}>AI Optimized</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action Plan</th>
            </tr>
          </thead>
          <tbody>
            {data.allData?.map((item) => (
              <tr key={item._id || item.id} style={trStyle}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: "700", color: "#1a202c" }}>{item.name}</div>
                  <div style={{ fontSize: "12px", color: "#a0aec0" }}>Stock: {item.stock} units</div>
                </td>
                <td style={{ ...tdStyle, width: "150px" }}>
                  <div style={{ height: "45px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={item.demandHistory || []}>
                        <Line 
                          type="monotone" 
                          dataKey="quantity" 
                          stroke={item.priceAction === "Increase" ? "#38a169" : item.priceAction === "Decrease" ? "#e53e3e" : "#3182ce"} 
                          strokeWidth={2.5} 
                          dot={false} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </td>
                <td style={tdStyle}>₹{item.currentPrice}</td>
                <td style={{ ...tdStyle, color: "#2f855a", fontWeight: "800" }}>₹{item.suggestedPrice}</td>
                <td style={tdStyle}>
                  <span style={actionBadgeStyle(item.priceAction)}>{item.priceAction}</span>
                </td>
                <td style={{ ...tdStyle, fontSize: "13px", color: "#4a5568", maxWidth: "250px", lineHeight: '1.4' }}>
                  {item.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- STYLING CONSTANTS (Keep as original) ---
const loaderStyle = { padding: "100px", textAlign: "center", color: "#2f855a", fontWeight: "bold" };
const heroCardStyle = { background: "#ffffff", padding: "30px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" };
const tableContainerStyle = { background: "#ffffff", borderRadius: "24px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)", border: "1px solid #e2e8f0", overflow: "hidden" };
const badgeStyle = { background: "#f0fff4", color: "#2f855a", padding: "6px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: "700" };
const thStyle = { padding: "15px 25px", textAlign: "left", fontSize: "12px", textTransform: "uppercase", color: "#718096", letterSpacing: "0.05em" };
const tdStyle = { padding: "20px 25px", borderBottom: "1px solid #edf2f7", verticalAlign: "middle" };
const trStyle = { transition: "background-color 0.2s" };

const actionBadgeStyle = (action) => ({
  padding: "5px 12px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: "800",
  textTransform: "uppercase",
  backgroundColor: action === "Increase" ? "#dcfce7" : action === "Decrease" ? "#fee2e2" : "#ebf8ff",
  color: action === "Increase" ? "#166534" : action === "Decrease" ? "#991b1b" : "#2b6cb0"
});