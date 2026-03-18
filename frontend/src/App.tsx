import { Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useCheckAuth } from "./hooks/useAuth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import ProfilePage from "./pages/ProfilePage";
import CreateProductPage from "./pages/CreateProductPage";
import { Toaster } from "sonner";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import Navbar from "./components/common/Navbar";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})

// App Initializer component to check auth on load
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const { setLoading } = useAuthStore();
  const { isLoading: isChecking } = useCheckAuth();

  useEffect(() => {
    setLoading(isChecking);
  }, [isChecking, setLoading]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};



export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/create"
              element={
                <AdminRoute>
                  <CreateProductPage />
                </AdminRoute>
              }
            />
            <Route path="/" element={<HomePage />} />
          </Routes>

        </div>
      </AppInitializer>

      <Toaster position="top-right" richColors />
    </QueryClientProvider>

  );
}
