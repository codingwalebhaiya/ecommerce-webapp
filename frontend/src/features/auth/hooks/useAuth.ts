import { api } from "@/services/api"
import { useAuthStore } from "@/store/auth.store"
import { useMutation } from "@tanstack/react-query"

export const useRegister = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post("/api/v1/auth/register", data)
            console.log(res)
            console.log(res.data)
            return res.data;

        }
    })
}

export const useLogin = () => {
    const setUser = useAuthStore((state) => state.setUser)
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post("/api/v1/auth/login", data)
            console.log(res)
            return res.data;
        },
        onSuccess: (data) => {
            setUser(data.user)
        }
    })
}