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
    selling_price: "", 
    category: "",
    unit: "pcs",
  });

  // --- 1. LOAD DATA (Simple Fetch) ---
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

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- 2. ADD / UPDATE LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
      ...form, 
      stock: Number(form.stock), 
      unit_price: Number(form.unit_price),
      selling_price: Number(form.selling_price) 
    };

    // Use editingId (_id) for PUT, otherwise POST
    const url = editingId 
      ? `http://localhost:5000/items/${editingId}` 
      : "http://localhost:5000/items";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Operation failed");
      
      // Reset form and refresh
      setForm({ name: "", stock: "", unit_price: "", selling_price: "", category: "", unit: "pcs" });
      setEditingId(null);
      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- 3. EDIT & DELETE ---
  const handleEdit = (item) => {
    setEditingId(item._id); // MongoDB uses _id
    setForm({
      name: item.name,
      stock: item.stock,
      unit_price: item.unit_price,
      selling_price: item.selling_price || "",
      category: item.category,
      unit: item.unit || "pcs",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const res = await fetch(`http://localhost:5000/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setItems(items.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0fdf4" }}>
      <p style={{ color: "#166534", fontWeight: "600" }}>Loading items...</p>
    </div>
  );

  if (error) return <p style={{ color: "red", padding: "100px" }}>Error: {error}</p>;

  return (
    <div style={{
      paddingTop: "120px",
      paddingBottom: "60px",
      minHeight: "100vh",
      background: "linear-gradient(180deg, #fefce8 0%, #f0fdf4 100%)",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>
        
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#166534", margin: "0 0 10px 0" }}>
            Stock Management
          </h2>
          <p style={{ color: "#4b5563" }}>Add, edit, and track your inventory levels.</p>
        </div>

        {/* ADD/EDIT FORM */}
        <form onSubmit={handleSubmit} style={formContainerStyle}>
          <input name="name" placeholder="Item name" value={form.name} onChange={handleChange} style={inputStyle} required />
          <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} style={{...inputStyle, width: "100px"}} required />
          <input name="unit_price" type="number" placeholder="Cost" value={form.unit_price} onChange={handleChange} style={{...inputStyle, width: "120px"}} required />
          <input name="selling_price" type="number" placeholder="Selling" value={form.selling_price} onChange={handleChange} style={{...inputStyle, width: "120px"}} required />
          <select name="category" value={form.category} onChange={handleChange} style={inputStyle} required>
            <option value="">Category</option>
            <option value="staple">Staple</option>
            <option value="optional">Optional</option>
          </select>

          <button type="submit" style={submitBtnStyle}>
            {editingId ? "Update Item" : "Add Item"}
          </button>
        </form>

        {/* INVENTORY GRID */}
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#6b7280" }}>No items in inventory.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {items.map((item) => (
              <div key={item._id} style={cardStyle}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong style={{ fontSize: "20px", color: "#111827" }}>{item.name}</strong>
                    <span style={categoryBadgeStyle(item.category)}>{item.category}</span>
                  </div>
                  
                  <div style={{ marginTop: "15px" }}>
                    <span style={{ fontSize: "24px", fontWeight: "800", color: "#166534" }}>{item.stock}</span> 
                    <span style={{ fontSize: "14px", color: "#4b5563", marginLeft: "4px" }}>{item.unit || 'units'}</span>
                  </div>
                  
                  <div style={{ marginTop: "10px", fontSize: "14px", color: "#6b7280" }}>
                    Cost: <span style={{ color: "#059669" }}>₹{item.unit_price}</span> | 
                    Sell: <span style={{ color: "#166534" }}>₹{item.selling_price}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button onClick={() => handleEdit(item)} style={{ ...actionBtn, backgroundColor: "#f3f4f6", color: "#374151" }}>Edit</button>
                  <button onClick={() => handleDelete(item._id)} style={{ ...actionBtn, backgroundColor: "#fee2e2", color: "#991b1b" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const formContainerStyle = {
  display: "flex", gap: "12px", marginBottom: "40px", flexWrap: "wrap",
  background: "rgba(255, 255, 255, 0.6)", padding: "24px", borderRadius: "20px",
  border: "1px solid rgba(250, 204, 21, 0.3)"
};

const inputStyle = {
  padding: "12px", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "14px", flex: "1", minWidth: "150px"
};

const submitBtnStyle = {
  background: "#166534", color: "white", border: "none", padding: "12px 28px",
  borderRadius: "12px", fontWeight: "700", cursor: "pointer"
};

const cardStyle = {
  background: "#ffffff", padding: "24px", borderRadius: "20px", border: "1px solid #e5e7eb",
  display: "flex", flexDirection: "column", justifyContent: "space-between"
};

const categoryBadgeStyle = (cat) => ({
  background: cat === "staple" ? "#dcfce7" : "#fef9c3",
  color: cat === "staple" ? "#166534" : "#854d0e",
  padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700"
});

const actionBtn = {
  flex: 1, padding: "10px", borderRadius: "10px", border: "none", fontWeight: "600", cursor: "pointer"
};