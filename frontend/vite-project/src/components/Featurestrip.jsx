export default function FeatureStrip() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      gap: "40px",
      padding: "40px"
    }}>
      <Feature title="Real-time Tracking" />
      <Feature title="Smart Categorization" />
      <Feature title="Demand Forecasting" />
    </div>
  );
}

function Feature({ title }) {
  return (
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "12px",
      width: "220px"
    }}>
      <h4>{title}</h4>
      <p style={{ color: "#6B7280" }}>
        AI-powered insights to help your shop grow.
      </p>
    </div>
  );
}
