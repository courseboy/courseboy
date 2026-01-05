import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, setAuthToken } from "@/lib/api";
import { useState, useEffect } from "react";

interface User {
  userId: number;
  email: string;
  username?: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      initializeAuth: () => {
        // Set the token in axios on app initialization
        const { accessToken } = get();
        if (accessToken) {
          setAuthToken(accessToken);
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          const { user, accessToken, refreshToken } = response.data.data;

          // Store tokens and set in axios header for cross-origin support
          setAuthToken(accessToken);

          set({
            user: {
              userId: user.id,
              email: user.email,
              username: user.username,
              roles: user.privileges || [], // Backend returns 'privileges' not 'roles'
            },
            accessToken,
            refreshToken,
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
        } catch {
          // Continue with logout even if API fails
        }
        setAuthToken(null);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        // Ensure token is set in axios
        setAuthToken(accessToken);

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
          // Token is invalid, clear auth state
          setAuthToken(null);
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hook to handle hydration - prevents hydration mismatch
export const useAuthHydration = () => {
  const [hydrated, setHydrated] = useState(false);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Wait for Zustand to rehydrate from localStorage
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => {
      // Initialize auth token after hydration
      initializeAuth();
      setHydrated(true);
    });

    // Check if already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      initializeAuth();
      setHydrated(true);
    }

    return () => {
      unsubFinishHydration();
    };
  }, [initializeAuth]);

  return hydrated;
};
