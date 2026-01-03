import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { authApi } from "@/lib/api";
import { useState, useEffect } from "react";

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
    (set) => ({
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
              roles: user.privileges || [], // Backend returns 'privileges' not 'roles'
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const apiError = error as { response?: { data?: { message?: string } } };
          const errorMessage =
            apiError.response?.data?.message || "Login failed";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
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
          const userData = response.data.data;
          set({
            user: {
              userId: userData.userId,
              email: userData.email,
              username: userData.username,
              roles: userData.privileges || [], // Backend returns 'privileges' not 'roles'
            },
            isAuthenticated: true,
          });
        } catch {
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

// Hook to handle hydration - prevents hydration mismatch
export const useAuthHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for Zustand to rehydrate from localStorage
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // Check if already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};
