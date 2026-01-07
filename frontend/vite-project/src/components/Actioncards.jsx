import { Link } from "react-router-dom";

export default function ActionCards() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      gap: "30px",
      paddingBottom: "60px"
    }}>
      
      <Card
        title="Manage Stock"
        desc="Track inventory levels and update quantities."
        link="/stock"
        color="#7C3AED"
      />

      <Card
        title="Track Demand"
        desc="Analyze customer demand and urgency."
        link="/demand"
        color="#FB923C"
      />
    </div>
  );
}

function Card({ title, desc, link, color }) {
  return (
    <div style={{
      background: "white",
      width: "280px",
      padding: "24px",
      borderRadius: "16px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
    }}>
      <h3>{title}</h3>
      <p style={{ color: "#6B7280" }}>{desc}</p>
      <Link to={link} style={{ color, fontWeight: "600" }}>
        Go →
      </Link>
    </div>
  );
}
