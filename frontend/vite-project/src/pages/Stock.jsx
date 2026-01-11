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

  // --- 1. LOAD DATA ---
  const fetchItems = async () => {
    try {
      // UPDATED URL
      const res = await fetch("https://gdg-hack.onrender.com/items");
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

    // UPDATED URLs
    const url = editingId 
      ? `https://gdg-hack.onrender.com/items/${editingId}` 
      : "https://gdg-hack.onrender.com/items";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Operation failed");
      
      setForm({ name: "", stock: "", unit_price: "", selling_price: "", category: "", unit: "pcs" });
      setEditingId(null);
      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- 3. DELETE ---
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      // UPDATED URL
      const res = await fetch(`https://gdg-hack.onrender.com/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setItems(items.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // ... (rest of your component styling and JSX remains exactly the same)
  // ... (ensure you keep the return statement and style constants from your original file)
}