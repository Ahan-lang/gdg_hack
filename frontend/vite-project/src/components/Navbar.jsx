import React, { useState, useEffect } from "react";

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "64px",
      // Professional Ochre Gradient
      background: "linear-gradient(90deg, #fefce8 0%, #fef9c3 100%)",
      borderBottom: "2px solid #facc15", // Sharp ochre border
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
    }}>
      <div style={{
        width: "95%",
        maxWidth: "1200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        
        {/* Logo Section */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          flexShrink: 0
        }}>
          <div style={{
            width: "28px",
            height: "28px",
            background: "#166534",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px"
          }}>V</div>
          <h1 style={{ 
            fontSize: isMobile ? "18px" : "20px", 
            margin: 0, 
            fontWeight: "800", 
            color: "#166534",
            letterSpacing: "-0.5px"
          }}>
            Vertex<span style={{ color: "#854d0e" }}>Inventory</span>
          </h1>
        </div>

        {/* Laptop-Only Links (Hidden on Mobile) */}
        {!isMobile && (
          <div style={{
            display: "flex",
            gap: "30px",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)"
          }}>
            {["Features", "Solutions", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  textDecoration: "none",
                  color: "#71717a",
                  fontSize: "14px",
                  fontWeight: "700",
                  transition: "color 0.2s"
                }}
                onMouseOver={(e) => (e.target.style.color = "#854d0e")}
                onMouseOut={(e) => (e.target.style.color = "#71717a")}
              >
                {item}
              </a>
            ))}
          </div>
        )}

        {/* Action Buttons (Always stay in one line) */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button style={{
            background: "none",
            border: "none",
            color: "#3f3f46",
            fontWeight: "700",
            fontSize: "14px",
            cursor: "pointer",
            display: isMobile ? "none" : "block" // Hide login on mobile to save space
          }}>
            Log in
          </button>
          <button style={{
            background: "#166534",
            color: "white",
            padding: isMobile ? "8px 14px" : "10px 20px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "700",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 4px 6px -1px rgba(22, 101, 52, 0.2)"
          }}
          onMouseOver={(e) => e.target.style.opacity = "0.9"}
          onMouseOut={(e) => e.target.style.opacity = "1"}
          >
            {isMobile ? "Join" : "Join Free"}
          </button>
        </div>

      </div>
    </nav>
  );
}