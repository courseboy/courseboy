import { create } from "zustand";
import { persist } from "zustand/middleware";
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
          const { user } = response.data.data;
          // Cookies are set automatically by the server with httpOnly flag

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
          const apiError = error as {
            response?: { data?: { message?: string } };
          };
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
          // Cookies are cleared automatically by the server
        } catch {
          // Continue with logout even if API fails
        }
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        // Try to get current user using httpOnly cookie
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
