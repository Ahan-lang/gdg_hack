export default function Hero() {
  return (
    <div style={{
      textAlign: "center",
      padding: "80px 20px"
    }}>
      <span style={{
        background: "#EDE9FE",
        color: "#7C3AED",
        padding: "6px 14px",
        borderRadius: "999px",
        fontSize: "14px"
      }}>
        AI-Powered Optimization
      </span>

      <h1 style={{
        fontSize: "48px",
        marginTop: "20px",
        color: "#111827"
      }}>
        Modern Inventory <br />
        <span style={{ color: "#7C3AED" }}>Management</span>
      </h1>

      <p style={{
        maxWidth: "600px",
        margin: "20px auto",
        color: "#6B7280"
      }}>
        Track stock, predict demand, and optimize cash flow
        using intelligent AI recommendations.
      </p>
    </div>
  );
}
