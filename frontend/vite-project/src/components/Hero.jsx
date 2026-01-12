import React from "react";

export default function Hero() {
  const dynamicWords = [
    "Managing Stock",
    "Predicting Demand",
    "Cash Optimization",
    "AI Recommendations"
  ];

  return (
    <>
      <style>
        {`
          @keyframes slideUp {
            0%, 20% { transform: translateY(0); }
            25%, 45% { transform: translateY(-20%); }
            50%, 70% { transform: translateY(-40%); }
            75%, 95% { transform: translateY(-60%); }
            100% { transform: translateY(-80%); }
          }

          .word-slider {
            display: block;
            /* Use clamp to make the slider height responsive */
            height: clamp(50px, 10vw, 80px); 
            overflow: hidden;
            margin-top: 5px;
          }

          .word-wrapper {
            display: flex;
            flex-direction: column;
            animation: slideUp 10s cubic-bezier(0.76, 0, 0.24, 1) infinite;
          }

          .dynamic-word {
            /* Match the height of the word-slider */
            height: clamp(50px, 10vw, 80px);
            line-height: clamp(50px, 10vw, 80px);
            color: #10b981; 
            white-space: nowrap;
          }
        `}
      </style>

      <div style={{
        textAlign: "center",
        padding: "clamp(80px, 15vh, 120px) 20px", // Responsive vertical padding
        background: "linear-gradient(180deg, #dcfce7 0%, #f0fdf4 100%)", 
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden" // Prevents the glow from causing horizontal scroll
      }}>
        
        <span style={{
          background: "#bbf7d0",
          color: "#065f46",
          padding: "8px 20px",
          borderRadius: "999px",
          fontSize: "14px",
          fontWeight: "600",
          border: "1px solid #86efac",
          marginBottom: "20px",
        }}>
          AI-Powered Optimization
        </span>

        <h1 style={{
          /* Fluid font size: min 32px, preferred 8vw, max 68px */
          fontSize: "clamp(32px, 8vw, 68px)",
          fontWeight: "800",
          color: "#064e3b",
          lineHeight: "1.1",
          letterSpacing: "-0.03em",
          margin: 0,
          width: "100%", // Ensures it doesn't overflow
          maxWidth: "1000px"
        }}>
          Effortless
          <div className="word-slider">
            <div className="word-wrapper">
              {dynamicWords.map((word, i) => (
                <span key={i} className="dynamic-word">{word}</span>
              ))}
              <span className="dynamic-word">{dynamicWords[0]}</span>
            </div>
          </div>
        </h1>

        <p style={{
          maxWidth: "600px",
          marginTop: "30px",
          color: "#374151",
          /* Fluid font size for paragraph */
          fontSize: "clamp(16px, 4vw, 20px)",
          lineHeight: "1.6",
          opacity: 0.9
        }}>
          The modern standard for businesses to <strong>track demand</strong>, 
          manage <strong>cash flow</strong>, and scale with AI-driven insights.
        </p>

        <div style={{
          position: "absolute",
          width: "clamp(300px, 80vw, 500px)", // Responsive decorative glow
          height: "clamp(300px, 80vw, 500px)",
          background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0) 70%)",
          zIndex: 0,
          pointerEvents: "none"
        }} />
      </div>
    </>
  );
}