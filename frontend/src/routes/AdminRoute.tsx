import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

const AdminRoute = ({ children }: any) => {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;

  return children ? children : <Outlet />;
};

export default AdminRoute;