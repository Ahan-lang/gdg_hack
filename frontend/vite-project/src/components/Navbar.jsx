import React from "react";

export default function Navbar() {
  return (
    <nav style={{
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "90%",
      maxWidth: "1200px",
      height: "70px",
      // Modern Light Yellow Tint with Glassmorphism
      background: "rgba(254, 252, 232, 0.8)", 
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderRadius: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 30px",
      zIndex: 1000,
      border: "1px solid rgba(250, 204, 21, 0.2)", // Subtle yellow border
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)"
    }}>
      {/* Logo */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontWeight: "800",
        fontSize: "22px",
        letterSpacing: "-0.5px",
        color: "#166534", // Dark Green
        cursor: "pointer"
      }}>
        <div style={{
          width: "32px",
          height: "32px",
          background: "linear-gradient(135deg, #fbbf24 0%, #10b981 100%)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "18px"
        }}>V</div>
        Vertex<span style={{ color: "#ca8a04" }}>Inventory</span>
      </div>

      {/* Navigation Links */}
      <div style={{
        display: "flex",
        gap: "35px",
        alignItems: "center"
      }}>
        {["Features", "Solutions", "Pricing", "About"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            style={{
              textDecoration: "none",
              color: "#4b5563",
              fontSize: "15px",
              fontWeight: "500",
              transition: "color 0.2s"
            }}
            onMouseOver={(e) => (e.target.style.color = "#ca8a04")}
            onMouseOut={(e) => (e.target.style.color = "#4b5563")}
          >
            {item}
          </a>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button style={{
          background: "none",
          border: "none",
          color: "#4b5563",
          fontWeight: "600",
          fontSize: "15px",
          cursor: "pointer"
        }}>
          Log in
        </button>
        <button style={{
          background: "#166534", // Deep Green to ground the yellow
          color: "white",
          padding: "10px 22px",
          borderRadius: "12px",
          border: "none",
          fontWeight: "600",
          fontSize: "15px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(22, 101, 52, 0.2)",
          transition: "transform 0.2s"
        }}
        onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
        onMouseOut={(e) => e.target.style.transform = "scale(1)"}
        >
          Join Free
        </button>
      </div>
    </nav>
  );
}