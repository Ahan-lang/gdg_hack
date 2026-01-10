import "./Actioncard.css";
import { Link } from "react-router-dom";

export default function ActionCards() {
  return (
    <div className="action-cards-wrapper">
      <Card
        title="Manage Stock"
        desc="Track inventory levels, update quantities, and categorize items efficiently."
        link="/stock"
        color="#7C3AED"
        icon="📦"
      />

      <Card
        title="Track Demand"
        desc="Monitor request flows, analyze urgency, and fulfill pending orders."
        link="/demand"
        color="#FB923C"
        icon="📊"
      />

      <Card
        title="Stock Recommendation"
        desc="AI-based advice on how much stock to buy or hold."
        link="/recommend"
        color="#2563EB"
        icon="🤖"
      />

      <Card
        title="Cash Recommendation"
        desc="AI guidance on how to spend limited cash smartly."
        link="/cash"
        color="#16A34A"
        icon="💰"
      />
    </div>
  );
}

function Card({ title, desc, link, color, icon }) {
  return (
    <Link to={link} className="action-card">
      <div className="action-card-blob" style={{ background: color }} />

      <div
        className="card-icon"
        style={{ background: `${color}22`, color }}
      >
        {icon}
      </div>

      <h3>{title}</h3>
      <p>{desc}</p>

      <span className="card-link" style={{ color }}>
        See {title.split(" ")[0]} →
      </span>
    </Link>
  );
}
