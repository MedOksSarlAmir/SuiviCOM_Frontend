import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types/auth";
import { toast } from "sonner";

// Import other stores to reset them
import { useSalesStore } from "./SaleStore";
import { useDashboardStore } from "./dashboardStore";
import { useInventoryStore } from "./InventoryStore";
import { usePurchaseStore } from "./PurchaseStore";
import { useVendorStore } from "./VendorStore";
import { useVisitStore } from "./VisitStore";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  useRealSession: boolean;
  setAuth: (user: User, token: string, isReal: boolean) => void;
  logout: () => void;
}

const INITIAL_STATE = {
  user: null,
  token: null,
  isAuthenticated: false,
  useRealSession: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setAuth: (user, token, isReal) => {
        set({ user, token, isAuthenticated: true, useRealSession: isReal });
        document.cookie = `access_token=${token}; path=/; max-age=43200; SameSite=Lax`;
      },

      logout: () => {
        // 1. Reset ALL other stores
        useSalesStore.getState().reset();
        useDashboardStore.getState().reset();
        useInventoryStore.getState().reset();
        usePurchaseStore.getState().reset();
        useVendorStore.getState().reset();
        useVisitStore.getState().reset();

        // 2. Clear Auth State
        set(INITIAL_STATE);

        // 3. Clear Storage & Cookies
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        localStorage.clear();

        toast.info("Déconnexion effectuée");

        // 4. Force hard redirect
        window.location.href = "/login";
      },
    }),
    {
      name: "suivicom-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
