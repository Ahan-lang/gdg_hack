import { useEffect, useState } from "react";

export default function Demand() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [demand, setDemand] = useState([]);
  const [quantity, setQuantity] = useState("");

  // --------------------
  // LOAD ITEMS (Logic Unchanged)
  // --------------------
  useEffect(() => {
    fetch("http://localhost:5000/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch(() => alert("Failed to load items"));
  }, []);

  // --------------------
  // RESET + LOAD DEMAND ON ITEM CHANGE (Logic Unchanged)
  // --------------------
  useEffect(() => {
    if (!selectedItem) {
      setDemand([]);
      setQuantity("");
      return;
    }

    setDemand([]); 

    fetch(`http://localhost:5000/demand/${selectedItem}`)
      .then((res) => res.json())
      .then((data) => setDemand(data))
      .catch(() => alert("Failed to load demand"));
  }, [selectedItem]);

  // --------------------
  // ADD NEXT WEEK DEMAND (Logic Unchanged)
  // --------------------
  const addWeek = async () => {
    if (!quantity || !selectedItem) return;

    await fetch("http://localhost:5000/demand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: Number(selectedItem),
        quantity: Number(quantity),
      }),
    });

    setQuantity("");

    const refreshed = await fetch(
      `http://localhost:5000/demand/${selectedItem}`
    );
    setDemand(await refreshed.json());
  };

  // --------------------
  // UPDATE EXISTING WEEK (Logic Unchanged)
  // --------------------
  const updateWeek = async (week, value) => {
    await fetch("http://localhost:5000/demand", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: Number(selectedItem),
        week,
        quantity: Number(value),
      }),
    });

    const refreshed = await fetch(
      `http://localhost:5000/demand/${selectedItem}`
    );
    setDemand(await refreshed.json());
  };

  // --------------------
  // UI RENDER (Modernized Layout)
  // --------------------
  return (
    <div style={{ 
      paddingTop: "140px", 
      paddingBottom: "60px",
      paddingLeft: "20px",
      paddingRight: "20px",
      minHeight: "100vh",
      background: "linear-gradient(180deg, #fefce8 0%, #f0fdf4 100%)",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#166534", margin: "0" }}>Demand Planning</h2>
          <p style={{ color: "#4b5563", marginTop: "5px" }}>Forecast and manage weekly requirements per item.</p>
        </div>

        {/* ITEM SELECT BOX */}
        <div style={{
          background: "white",
          padding: "25px",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          marginBottom: "25px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
        }}>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "600", color: "#374151" }}>Select Inventory Item</label>
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="">Select Item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* DEMAND SECTION */}
        {selectedItem && (
          <div style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(8px)",
            padding: "30px",
            borderRadius: "20px",
            border: "1px solid rgba(250, 204, 21, 0.3)"
          }}>
            <h3 style={{ color: "#166534", marginTop: "0", marginBottom: "20px" }}>Weekly Demand (Max 12 Weeks)</h3>

            <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
              <input
                type="number"
                placeholder="Enter demand value"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{
                  flex: "1",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  outline: "none"
                }}
              />
              <button 
                onClick={addWeek}
                style={{
                  padding: "0 25px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#166534",
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Add Week
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
              {demand.map((d) => (
                <div key={d.week} style={{
                  background: "white",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <span style={{ fontWeight: "700", color: "#374151" }}>Week {d.week}</span>
                  <input
                    type="number"
                    value={d.quantity}
                    onChange={(e) => {
                      updateWeek(d.week, e.target.value);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#10b981",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}