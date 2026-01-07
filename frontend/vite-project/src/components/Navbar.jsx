export default function Navbar() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 40px",
      background: "white",
      borderBottom: "1px solid #E5E7EB"
    }}>
      <h2 style={{ color: "#7C3AED" }}>VertexInventory</h2>

      <div style={{ display: "flex", gap: "16px" }}>
        <button>🌐</button>
        <button style={{
          background: "#7C3AED",
          color: "white",
          padding: "8px 16px",
          borderRadius: "8px",
          border: "none"
        }}>
          Login
        </button>
      </div>
    </div>
  );
}
