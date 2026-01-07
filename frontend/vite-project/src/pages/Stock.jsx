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

  // -------------------------
  // FETCH ITEMS
  // -------------------------
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

  // -------------------------
  // FORM HANDLERS
  // -------------------------
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // -------------------------
  // ADD / EDIT ITEM
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      stock: Number(form.stock),
      unit_price: Number(form.unit_price),
    };

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

      const refreshed = await fetch("http://localhost:5000/items");
      const data = await refreshed.json();
      setItems(data);

      setForm({
        name: "",
        stock: "",
        unit_price: "",
        category: "",
        unit: "pcs",
      });

      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // -------------------------
  // EDIT BUTTON
  // -------------------------
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

  // -------------------------
  // DELETE ITEM
  // -------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      const res = await fetch(`http://localhost:5000/items/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // -------------------------
  // UI STATES
  // -------------------------
  if (loading) return <p>Loading items...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div
      style={{
        padding: "20px",
        background: "#ffffff",
        color: "#111111",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <h2>Stock Management</h2>

      {/* ADD / EDIT FORM */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          name="name"
          placeholder="Item name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
          required
        />

        <input
          name="unit_price"
          type="number"
          placeholder="Unit price"
          value={form.unit_price}
          onChange={handleChange}
          required
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Category</option>
          <option value="staple">Staple</option>
          <option value="optional">Optional</option>
        </select>

        <button type="submit">
          {editingId ? "Update Item" : "Add Item"}
        </button>
      </form>

      {/* ITEMS LIST */}
      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                marginBottom: "12px",
                padding: "12px",
                border: "1px solid #eee",
                borderRadius: "8px",
              }}
            >
              <strong>{item.name}</strong> — {item.stock} {item.unit}
              <br />
              <small>
                Category: {item.category} | Price: ${item.unit_price}
              </small>
              <br />

              <button
                onClick={() => handleEdit(item)}
                style={{ marginRight: "10px" }}
              >
                Edit
              </button>

              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
