import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  setAuth: (payload: { user: User; token: string }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAdmin: false,
      setAuth: ({ user, token }) =>
        set({
          user,
          token,
          isAdmin: (user.role ?? "").toUpperCase() === "ADMIN",
        }),
      clearAuth: () => set({ user: null, token: null, isAdmin: false }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
