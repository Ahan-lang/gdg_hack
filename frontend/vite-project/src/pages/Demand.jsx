import { useEffect, useState } from "react";

export default function Demand() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [demand, setDemand] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    // UPDATED URL
    fetch("https://gdg-hack.onrender.com/items")
      .then((res) => res.json())
      .then((data) => setItems(data || []))
      .catch(() => console.error("Failed to load items"));
  }, []);

  useEffect(() => {
    if (selectedItem) fetchHistory();
    else setDemand([]);
  }, [selectedItem]);

  const fetchHistory = async () => {
    try {
      // UPDATED URL
      const res = await fetch(`https://gdg-hack.onrender.com/demand/${selectedItem}`);
      const data = await res.json();
      setDemand(data);
    } catch (err) { console.error("Error fetching history"); }
  };

  const addWeek = async () => {
    if (!quantity || Number(quantity) < 0) return alert("Enter positive number");
    setLoading(true);
    try {
      // UPDATED URL
      const res = await fetch("https://gdg-hack.onrender.com/demand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: selectedItem, quantity: Number(quantity) }),
      });
      const updated = await res.json();
      setDemand(updated);
      setQuantity("");
    } catch (err) { alert("Save failed"); }
    finally { setLoading(false); }
  };

  const saveEdit = async (id) => {
    try {
      // UPDATED URL
      const res = await fetch(`https://gdg-hack.onrender.com/demand/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: selectedItem, quantity: Number(editValue) }),
      });
      const updated = await res.json();
      setDemand(updated);
      setEditingId(null);
    } catch (err) { alert("Edit failed"); }
  };

  return (
    <div style={containerStyle}>
      <div style={headerSection}>
        <h2 style={titleStyle}>Demand Intelligence</h2>
        <p style={subtitleStyle}>Manage and refine weekly sales data for optimized forecasting.</p>
      </div>
      
      <div style={cardStyle}>
        <div style={formGroup}>
          <label style={labelStyle}>Selected Product</label>
          <select 
            value={selectedItem} 
            onChange={(e) => setSelectedItem(e.target.value)}
            style={selectStyle}
          >
            <option value="">Choose a product from inventory...</option>
            {items.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select>
        </div>

        {selectedItem && (
          <div style={quickAddBar}>
            <input 
              type="number" 
              placeholder="Enter units sold..." 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              style={inlineInput}
            />
            <button onClick={addWeek} style={primaryBtn}>
              {loading ? "Saving..." : "Log Weekly Sales"}
            </button>
          </div>
        )}

        {demand.length > 0 && (
          <div style={tableContainer}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Timeline</th>
                  <th style={thStyle}>Performance</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {demand.map((d) => (
                  <tr key={d._id} style={trStyle}>
                    <td style={tdStyle}>Week {d.week}</td>
                    <td style={tdStyle}>
                      {editingId === d._id ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)} 
                          style={editInputStyle}
                        />
                      ) : (
                        <span style={quantityText}>{d.quantity} <small style={{color: '#94a3b8'}}>units</small></span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {editingId === d._id ? (
                        <button onClick={() => saveEdit(d._id)} style={confirmBtn}>Save Changes</button>
                      ) : (
                        <button 
                          onClick={() => { setEditingId(d._id); setEditValue(d.quantity); }} 
                          style={ghostBtn}
                        >
                          Edit Entry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES (Unchanged) ---
const containerStyle = { padding: "60px 20px", maxWidth: "1000px", margin: "0 auto", color: "#1e293b", fontFamily: "'Inter', system-ui, sans-serif" };
const headerSection = { marginBottom: "40px", textAlign: "center" };
const titleStyle = { fontSize: "2.25rem", fontWeight: "800", letterSpacing: "-0.025em", marginBottom: "8px" };
const subtitleStyle = { color: "#64748b", fontSize: "1.1rem" };
const cardStyle = { background: "#ffffff", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", border: "1px solid #f1f5f9" };
const formGroup = { marginBottom: "24px" };
const labelStyle = { display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#475569", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" };
const selectStyle = { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "1rem", backgroundColor: "#f8fafc", cursor: "pointer", transition: "all 0.2s" };
const quickAddBar = { display: "flex", gap: "12px", background: "#f1f5f9", padding: "16px", borderRadius: "12px", marginBottom: "32px" };
const inlineInput = { flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" };
const primaryBtn = { background: "#0f172a", color: "#fff", border: "none", padding: "0 24px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", transition: "opacity 0.2s" };
const tableContainer = { borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = { background: "#f8fafc", padding: "14px 20px", textAlign: "left", fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase" };
const tdStyle = { padding: "16px 20px", borderTop: "1px solid #f1f5f9", fontSize: "0.95rem" };
const trStyle = { transition: "background 0.2s" };
const quantityText = { fontWeight: "700", color: "#059669", fontSize: "1.1rem" };
const ghostBtn = { background: "transparent", border: "1.5px solid #e2e8f0", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600", color: "#475569" };
const confirmBtn = { background: "#059669", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem", fontWeight: "600" };
const editInputStyle = { width: "80px", padding: "6px", borderRadius: "4px", border: "2px solid #3b82f6", outline: "none" };