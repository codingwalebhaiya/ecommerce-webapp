import { Routes, Route } from "react-router-dom";
//import { useAuthStore } from "@/store/auth.store";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import HomePage from "./features/auth/pages/HomePage";

export default function App() {
  return (
    <Routes>
      <Route  path="/" element={<HomePage/>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ================= 404 ================= */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}
