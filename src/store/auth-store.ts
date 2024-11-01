// store/auth-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "SCORER" | "TEAM_MANAGER";
}

interface AuthState {
  user: User | null;
  permissions: any | null;
  setUser: (user: User | null) => void;
  setPermissions: (permissions: any | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      permissions: null,
      setUser: (user) => set({ user }),
      setPermissions: (permissions) => set({ permissions }),
    }),
    {
      name: "auth-storage",
    }
  )
);
