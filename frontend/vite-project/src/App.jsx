
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Stock from "./pages/Stock";
import Demand from "./pages/Demand";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/demand" element={<Demand />} />
      </Route>
    </Routes>
  );
}
