import React, { useState, useEffect } from "react";

export default function Navbar() {
  // Logic to detect mobile screen for responsive styling
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav style={{
      position: "fixed",
      top: isMobile ? "10px" : "20px",
      left: "50%",
      transform: "translateX(-50%)",
      width: isMobile ? "95%" : "90%",
      maxWidth: "1200px",
      height: isMobile ? "auto" : "70px",
      minHeight: "60px",
      background: "rgba(254, 252, 232, 0.9)", 
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderRadius: isMobile ? "15px" : "20px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row", // Stack elements on mobile
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "15px 20px" : "0 30px",
      zIndex: 1000,
      border: "1px solid rgba(250, 204, 21, 0.2)",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
      gap: isMobile ? "10px" : "0"
    }}>
      {/* Logo */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontWeight: "900", // Made extra bold
        fontSize: isMobile ? "18px" : "22px",
        letterSpacing: "-0.5px",
        color: "#166534",
        cursor: "pointer"
      }}>
        <div style={{
          width: isMobile ? "28px" : "32px",
          height: isMobile ? "28px" : "32px",
          background: "linear-gradient(135deg, #fbbf24 0%, #10b981 100%)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "16px"
        }}>V</div>
        <span style={{ fontWeight: "800" }}>Vertex</span>
        <span style={{ color: "#ca8a04", fontWeight: "800" }}>Inventory</span>
      </div>

      {/* Navigation Links - Now hidden or wrapped on very small screens */}
      {!isMobile && (
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
                fontWeight: "700", // Made Bold
                transition: "color 0.2s"
              }}
              onMouseOver={(e) => (e.target.style.color = "#ca8a04")}
              onMouseOut={(e) => (e.target.style.color = "#4b5563")}
            >
              {item}
            </a>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: isMobile ? "10px" : "15px",
        width: isMobile ? "100%" : "auto",
        justifyContent: isMobile ? "center" : "flex-end"
      }}>
        <button style={{
          background: "none",
          border: "none",
          color: "#4b5563",
          fontWeight: "700", // Made Bold
          fontSize: isMobile ? "14px" : "15px",
          cursor: "pointer"
        }}>
          Log in
        </button>
        <button style={{
          background: "#166534",
          color: "white",
          padding: isMobile ? "8px 16px" : "10px 22px",
          borderRadius: "12px",
          border: "none",
          fontWeight: "700", // Made Bold
          fontSize: isMobile ? "14px" : "15px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(22, 101, 52, 0.2)"
        }}>
          Join Free
        </button>
      </div>
    </nav>
  );
}