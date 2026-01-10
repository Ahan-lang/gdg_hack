import { useEffect, useState } from "react";

export default function Stock() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    stock: "",
    unit_price: "",
    category: "",
    unit: "pcs",
  });

  // --- LOGIC (KEEPING 100% UNCHANGED) ---
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("http://localhost:5000/items");
        if (!res.ok) throw new Error("Failed to fetch items");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, stock: Number(form.stock), unit_price: Number(form.unit_price) };
    const url = editingId ? `http://localhost:5000/items/${editingId}` : "http://localhost:5000/items";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Operation failed");
      const refreshed = await fetch("http://localhost:5000/items");
      const data = await refreshed.json();
      setItems(data);
      setForm({ name: "", stock: "", unit_price: "", category: "", unit: "pcs" });
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      stock: item.stock,
      unit_price: item.unit_price,
      category: item.category,
      unit: item.unit || "pcs",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const res = await fetch(`http://localhost:5000/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // --- MODERN UI RENDER ---

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0fdf4" }}>
      <p style={{ color: "#166534", fontWeight: "600" }}>Loading items...</p>
    </div>
  );

  if (error) return <p style={{ color: "red", padding: "100px" }}>{error}</p>;

  return (
    <div style={{
      paddingTop: "120px", // Solves Navbar hiding the content
      paddingBottom: "60px",
      minHeight: "100vh",
      background: "linear-gradient(180deg, #fefce8 0%, #f0fdf4 100%)", // Light Yellow to Green
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#166534", margin: "0 0 10px 0", letterSpacing: "-1px" }}>
            Stock Management
          </h2>
          <p style={{ color: "#4b5563", fontSize: "16px" }}>Add, edit, and track your inventory levels in real-time.</p>
        </div>

        {/* ADD / EDIT FORM (Modern Card) */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "40px",
            flexWrap: "wrap",
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(10px)",
            padding: "24px",
            borderRadius: "20px",
            border: "1px solid rgba(250, 204, 21, 0.3)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
          }}
        >
          <input
            name="name"
            placeholder="Item name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <input
            name="stock"
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            style={{...inputStyle, width: "100px"}}
            required
          />
          <input
            name="unit_price"
            type="number"
            placeholder="Unit price"
            value={form.unit_price}
            onChange={handleChange}
            style={{...inputStyle, width: "120px"}}
            required
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Category</option>
            <option value="staple">Staple</option>
            <option value="optional">Optional</option>
          </select>

          <button type="submit" style={{
            background: "#166534",
            color: "white",
            border: "none",
            padding: "12px 28px",
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "15px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(22, 101, 52, 0.2)",
            transition: "all 0.2s"
          }}>
            {editingId ? "Update Item" : "Add Item"}
          </button>
        </form>

        {/* ITEMS LIST */}
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#6b7280" }}>No items found in inventory.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  borderRadius: "20px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <strong style={{ fontSize: "20px", color: "#111827", display: "block" }}>{item.name}</strong>
                    <span style={{ 
                      background: item.category === "staple" ? "#dcfce7" : "#fef9c3",
                      color: item.category === "staple" ? "#166534" : "#854d0e",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      textTransform: "uppercase"
                    }}>{item.category}</span>
                  </div>
                  
                  <div style={{ marginTop: "15px", color: "#4b5563" }}>
                    <span style={{ fontSize: "24px", fontWeight: "800", color: "#166534" }}>{item.stock}</span> 
                    <span style={{ fontSize: "14px", marginLeft: "4px" }}>{item.unit} available</span>
                  </div>
                  
                  <div style={{ marginTop: "5px", color: "#6b7280", fontSize: "14px" }}>
                    Unit Price: <span style={{ fontWeight: "600", color: "#059669" }}>${item.unit_price}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button
                    onClick={() => handleEdit(item)}
                    style={{ ...actionBtn, backgroundColor: "#f3f4f6", color: "#374151" }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ ...actionBtn, backgroundColor: "#fee2e2", color: "#991b1b" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-styles
const inputStyle = {
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  outline: "none",
  flex: "1",
  minWidth: "150px"
};

const actionBtn = {
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  transition: "opacity 0.2s"
};