import { useState, useEffect } from "react";

export default function CashRecommend() {
  const [items, setItems] = useState([]);
  const [budget, setBudget] = useState("");
  const [plan, setPlan] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/items")
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  const calculatePlan = () => {
    let currentBudget = Number(budget);
    const sortedItems = [...items].sort((a, b) => (b.selling_price - b.unit_price) - (a.selling_price - a.unit_price));
    
    let allocation = [];
    sortedItems.forEach(item => {
      if (currentBudget >= item.unit_price) {
        let count = Math.floor(currentBudget / item.unit_price);
        if (count > 0) {
          allocation.push({ name: item.name, quantity: count, cost: count * item.unit_price });
          currentBudget -= count * item.unit_price;
        }
      }
    });
    setPlan(allocation);
  };

  return (
    <div style={{ padding: "120px 20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ color: "#166534" }}>Cash Flow Optimizer</h2>
      
      <div style={{ background: "white", padding: "30px", borderRadius: "20px", border: "1px solid #e5e7eb" }}>
        <div style={{ marginBottom: "25px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>Available Budget (₹)</label>
          <input 
            type="number" 
            value={budget} 
            onChange={(e) => setBudget(e.target.value)}
            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #d1d5db" }}
            placeholder="Enter total money to invest"
          />
        </div>

        <button 
          onClick={calculatePlan}
          style={{ width: "100%", padding: "15px", background: "#166534", color: "white", borderRadius: "10px", fontWeight: "bold", border: "none" }}
        >
          Optimize Purchases
        </button>

        {plan.length > 0 && (
          <div style={{ marginTop: "30px" }}>
            <h3>Optimal Purchase Plan</h3>
            {plan.map((p, idx) => (
              <div key={idx} style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                <strong>{p.name}</strong>: {p.quantity} units (Total: ₹{p.cost})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}