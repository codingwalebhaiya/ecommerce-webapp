import { Navigate } from "react-router-dom";
import React from "react";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }


  return isAuthenticated ? children : <Navigate to='/login' />

}


export default ProtectedRoute;

