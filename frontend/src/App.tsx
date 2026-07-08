import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import UserLayout from "@/components/layout/UserLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminRoute from "@/routes/AdminRoute";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProductsPage from "@/pages/ProductsPage";
import ProfilePage from "@/pages/ProfilePage";
//import CreateProductPage from "@/pages/CreateProductPage";

import UserDashboardPage from "@/pages/user/UserDashboardPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import { useEffect } from "react";
import { useProfile } from "./hooks/useAuth";
import { useAuthStore } from "./redux/authStore";
import { LoaderCircleIcon } from "lucide-react";
import UserListPage from "./pages/admin/users/UserListPage";
import UserDetailsPage from "./pages/admin/users/UserDetailsPage";
import ProductListPage from "./pages/admin/products/ProductListPage";
import CreateProductPage from "./pages/admin/products/CreateProductPage";
import EditProductPage from "./pages/admin/products/EditProductPage";


export default function App() {
  const { data, isLoading } = useProfile()
  const { setUser, clearAuth } = useAuthStore()


  useEffect(() => {
    if (isLoading) return;

    if (data?.data) {
      setUser(data.data);
    } else {
      clearAuth();
    }
  }, [data, isLoading]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircleIcon className="h-6 w-6 animate-spin mr-2" />
      </div>
    );
  }

  return (
    <>




      <Routes>
        {/* Public Routes under PublicLayout (has general Navbar and Footer) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected User Routes under UserLayout */}
        <Route
          element={
            <ProtectedRoute  >
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cart" element={<div className="p-6 text-center text-xl font-semibold">Shopping Cart (Interface Pending)</div>} />
          <Route path="/orders" element={<div className="p-6 text-center text-xl font-semibold">My Orders (Interface Pending)</div>} />
        </Route>

        {/* Protected Admin Routes under AdminLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          {/* <Route path="profile" element={<AdminProfilePage />} /> */}
          <Route path="users" element={<UserListPage />} />
          <Route path="users/:id" element={<UserDetailsPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/create" element={<CreateProductPage />} />
          <Route path="products/:id/edit" element={<EditProductPage />} />
          {/* <Route path="categories" element={<CategoryListPage />} />
          <Route path="categories/create" element={<CreateCategoryPage />} />
          <Route path="categories/:id/edit" element={<EditCategoryPage />} />
          <Route path="orders" element={<OrderListPage/>}  />
          <Route path="orders/:id" element={<OrderDetailsPage/>}  />  */}


        </Route>

        {/* Fallback Catch-all -> Redirects to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>


    </>
  );
}
