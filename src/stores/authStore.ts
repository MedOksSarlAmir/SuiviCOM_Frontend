import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types/auth";

// Import other stores to reset them
import { useSalesStore } from "./SaleStore";
import { useDashboardStore } from "./dashboardStore";
// Import InventoryStore, etc. if you have them

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  useRealSession: boolean;
  setAuth: (user: User, token: string, isReal: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      useRealSession: false,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
        document.cookie = `access_token=${token}; path=/; max-age=43200; SameSite=Lax`;
      },

      logout: () => {
        // 1. Reset ALL other stores
        useSalesStore.getState().reset();
        useDashboardStore.getState().reset();
        // useInventoryStore.getState().reset(); // Add others here as you build them

        // 2. Clear Auth State
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          useRealSession: false,
        });

        // 3. Clear Storage & Cookies
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        localStorage.clear(); // This kills the persisted auth state immediately

        // 4. Force hard redirect to ensure memory is cleared
        window.location.href = "/login";
      },
    }),
    {
      name: "suivicom-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
