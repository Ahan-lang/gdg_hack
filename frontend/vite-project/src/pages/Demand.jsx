import { useEffect, useState } from "react";

export default function Demand() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [demand, setDemand] = useState([]);
  const [quantity, setQuantity] = useState("");

  // --------------------
  // LOAD ITEMS
  // --------------------
  useEffect(() => {
    fetch("http://localhost:5000/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch(() => alert("Failed to load items"));
  }, []);

  // --------------------
  // RESET + LOAD DEMAND ON ITEM CHANGE
  // --------------------
  useEffect(() => {
    if (!selectedItem) {
      setDemand([]);
      setQuantity("");
      return;
    }

    setDemand([]); // 🔥 VERY IMPORTANT RESET

    fetch(`http://localhost:5000/demand/${selectedItem}`)
      .then((res) => res.json())
      .then((data) => setDemand(data))
      .catch(() => alert("Failed to load demand"));
  }, [selectedItem]);

  // --------------------
  // ADD NEXT WEEK DEMAND
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
  // UPDATE EXISTING WEEK
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

  return (
    <div style={{ padding: 20 }}>
      <h2>Demand Planning</h2>

      {/* ITEM SELECT */}
      <select
        value={selectedItem}
        onChange={(e) => setSelectedItem(e.target.value)}
      >
        <option value="">Select Item</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>

      {/* DEMAND SECTION */}
      {selectedItem && (
        <>
          <h3>Weekly Demand (Max 12 Weeks)</h3>

          <input
            type="number"
            placeholder="Enter demand"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <button onClick={addWeek}>Add Week</button>

          <ul>
            {demand.map((d) => (
              <li key={d.week}>
                Week {d.week}:{" "}
                <input
                  type="number"
                  value={d.quantity}
                  onChange={(e) => {
                    updateWeek(d.week, e.target.value);
                  }}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
