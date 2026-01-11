import Hero from "../components/Hero";
import Actioncards from "../components/Actioncards";

// 1. Import the Analytics Dashboard
import AnalyticsDashboard from "../components/AnalyticsDashboard";

export default function Home() {
  return (
    <div>
      <Hero />
      
      <Actioncards />

      {/* 2. Add the Dashboard inside a container for proper alignment */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 60px 20px" }}>
        <AnalyticsDashboard />
      </div>
      
      {/* If you want the FeatureStrip back, you can place it here */}
      {/* <FeatureStrip /> */}
    </div>
  );
}