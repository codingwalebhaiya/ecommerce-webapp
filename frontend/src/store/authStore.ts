import { User } from "@/types/auth.types"
import { create } from "zustand"
import { persist } from "zustand/middleware"


interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setAuthenticated: (value: boolean) => void;
    setLoading: (value: boolean) => void;
    logout: () => void;
    checkAuth: () => Promise<boolean>
}



export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            setUser: (user) => set({ user }),
            setAuthenticated: (value) => set({ isAuthenticated: value }),
            setLoading: (value) => set({ isLoading: value }),
            logout: () => {
                set({ user: null, isAuthenticated: false })
            },
            checkAuth: async () => {
                return get().isAuthenticated;
            }
        }),

        {
            name: "auth-storage",
            partialize: (state) => ({ user: state.user })
        }
    )
)