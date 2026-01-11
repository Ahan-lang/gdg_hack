import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Stock from "./pages/Stock";
import Demand from "./pages/Demand";
import Recommend from "./pages/Recommend";
import CashRecommend from "./pages/CashRecommend";

export default function App() {
  return (
    <Routes>
      {/* Standard routing without Auth Guards or ProtectedRoutes.
        This allows direct access to all pages as per your original setup.
      */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/demand" element={<Demand />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/cash" element={<CashRecommend />} />
      </Route>
    </Routes>
  );
}