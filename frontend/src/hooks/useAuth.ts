import { api } from "@/api/api"
import { fetchProfile, loginUser, logoutUser, registerUser } from "@/api/auth.service"
import { LoginInputCredentials, RegisterInputCredentials } from "@/schemas/auth.schema"
import { useAuthStore } from "@/store/authStore"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

// Hook to check authentication status on app load
export const useCheckAuth = () => {
  const { setUser, setAuthenticated } = useAuthStore();


  return useQuery({
    queryKey: ['checkAuth'],
    queryFn: async () => {
      try {
        const { data } = await api.get("/auth/profile");
      //  console.log(data)
        setUser(data.data)
        setAuthenticated(true)
        return data.data;
      } catch (error) {
        setUser(null)
        setAuthenticated(false)
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

// register hook
export const useRegister = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (userData: RegisterInputCredentials) => registerUser(userData),
    onSuccess: () => {
      toast.success("Registeration successful! Please login.");
      navigate('/login')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registeration failed')
    }
  })
}

// login hook
export const useLogin = () => {
  const navigate = useNavigate();
  const { setUser, setAuthenticated } = useAuthStore();
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: LoginInputCredentials) => loginUser(userData),
    onSuccess: (data) => {
      //set user in store 
      setUser(data.data.user);
      setAuthenticated(true);

      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: ['profile'] })

      toast.success("Login successful")
      navigate('/')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  })
}

// profile hook
export const useProfile = () => {
  const { setUser, setAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const data = await fetchProfile();
      console.log(data)
      return data.data;
    },
    onSuccess: (user) => {
      setUser(user);
      setAuthenticated(true);
    },
    onError: () => {
      setUser(null);
      setAuthenticated(false);
    },
    retry: false,
  });
};

// logout hook
export const useLogout = () => {

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout: storeLogout } = useAuthStore()


  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      storeLogout();  // clear store 
      queryClient.clear();  // clear all queries from cache 
      toast.success('Logged out successfully')
      navigate("/login")

    },
    onError: () => {
      storeLogout(); // Even if logout fails, clear local state
      queryClient.clear();
      navigate('/login')
    }
  })
}