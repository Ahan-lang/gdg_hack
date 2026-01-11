import { useEffect, useState } from "react";

export default function Demand() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [demand, setDemand] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  // --------------------
  // LOAD ALL ITEMS
  // --------------------
  useEffect(() => {
    fetch("http://localhost:5000/items")
      .then((res) => res.json())
      .then((data) => setItems(data || []))
      .catch(() => console.error("Failed to load items"));
  }, []);

  // --------------------
  // LOAD DEMAND FOR SELECTED ITEM
  // --------------------
  useEffect(() => {
    if (!selectedItem) {
      setDemand([]);
      return;
    }

    fetch(`http://localhost:5000/demand/${selectedItem}`)
      .then((res) => res.json())
      .then((data) => setDemand(Array.isArray(data) ? data : []))
      .catch(() => console.error("Failed to load demand"));
  }, [selectedItem]);

  // --------------------
  // ADD NEW WEEKLY DATA (POST)
  // --------------------
  const addWeek = async () => {
    if (!quantity || !selectedItem) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/demand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: selectedItem,
          quantity: Number(quantity),
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      const updatedHistory = await res.json();
      setDemand(updatedHistory);
      setQuantity("");
    } catch (err) {
      alert("Failed to add demand. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Sales Demand Tracking</h2>
      <p style={subHeaderStyle}>Log weekly sales to power your AI recommendations.</p>

      <div style={cardStyle}>
        {/* ITEM SELECTION */}
        <div style={{ marginBottom: "25px" }}>
          <label style={labelStyle}>Select Product to Update</label>
          <select 
            value={selectedItem} 
            onChange={(e) => setSelectedItem(e.target.value)}
            style={inputStyle}
          >
            <option value="">Choose an item...</option>
            {items.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} (Stock: {item.stock})
              </option>
            ))}
          </select>
        </div>

        {/* INPUT FIELD */}
        {selectedItem && (
          <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Quantity Sold This Week</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 45"
                style={inputStyle}
              />
            </div>
            <button 
              onClick={addWeek} 
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? "Saving..." : "Log Sales"}
            </button>
          </div>
        )}

        {/* DEMAND HISTORY TABLE */}
        {selectedItem && demand.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h4 style={{ color: "#2d3748", marginBottom: "15px" }}>Recent History</h4>
            <div style={tableWrapper}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #edf2f7" }}>
                    <th style={thStyle}>Timeframe</th>
                    <th style={thStyle}>Quantity Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {demand.map((d, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #edf2f7" }}>
                      <td style={tdStyle}>Week {d.week}</td>
                      <td style={{ ...tdStyle, fontWeight: "700", color: "#2f855a" }}>
                        {d.quantity} units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedItem && demand.length === 0 && (
          <div style={emptyStateStyle}>No sales data found for this item yet.</div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = { padding: "140px 20px 60px 20px", maxWidth: "900px", margin: "0 auto", fontFamily: "Inter, sans-serif" };
const headerStyle = { fontSize: "32px", fontWeight: "800", color: "#1a202c", marginBottom: "8px" };
const subHeaderStyle = { color: "#718096", marginBottom: "40px" };
const cardStyle = { background: "#fff", padding: "35px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" };
const labelStyle = { display: "block", marginBottom: "10px", fontWeight: "600", color: "#4a5568", fontSize: "14px" };
const inputStyle = { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #cbd5e0", fontSize: "16px", outline: "none" };
const buttonStyle = { padding: "0 30px", background: "#2f855a", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", height: "52px", alignSelf: "flex-end", transition: "0.2s" };
const tableWrapper = { borderRadius: "12px", border: "1px solid #edf2f7", overflow: "hidden" };
const thStyle = { padding: "12px", textAlign: "left", color: "#718096", fontSize: "12px", textTransform: "uppercase" };
const tdStyle = { padding: "15px 12px", fontSize: "15px", color: "#2d3748" };
const emptyStateStyle = { textAlign: "center", padding: "40px", color: "#a0aec0", fontStyle: "italic" };