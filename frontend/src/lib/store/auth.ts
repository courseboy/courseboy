import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { authApi } from "@/lib/api";

interface User {
  userId: number;
  email: string;
  username?: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          const { user, accessToken, refreshToken } = response.data.data;

          Cookies.set("accessToken", accessToken, { expires: 7 });
          Cookies.set("refreshToken", refreshToken, { expires: 30 });

          set({
            user: {
              userId: user.id,
              email: user.email,
              username: user.username,
              roles: user.roles,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Continue with logout even if API fails
        }
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const token = Cookies.get("accessToken");
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          const response = await authApi.me();
          const user = response.data.data;
          set({
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
