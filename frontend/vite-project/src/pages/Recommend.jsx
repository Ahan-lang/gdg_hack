import { useState, useEffect } from "react";

export default function Recommend() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [isFestival, setIsFestival] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // UPDATED URL
    fetch("https://gdg-hack.onrender.com/items")
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, []);

  const handleGetRecommendation = async () => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      // UPDATED URL
      const res = await fetch("https://gdg-hack.onrender.com/recommend/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: selectedItem, isFestival }),
      });
      const data = await res.json();
      setRecommendation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of your component styling and JSX remains exactly the same)
}