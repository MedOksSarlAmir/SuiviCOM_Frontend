import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types/auth";
import { useSalesStore } from "./SaleStore";
import { useDashboardStore } from "./DashboardStore";
import { useInventoryStore } from "./InventoryStore";
import { usePurchaseStore } from "./PurchaseStore";
import { useVendorStore } from "./VendorStore";
import { useVisitStore } from "./VisitStore";
import { useAdminUserStore } from "./AdminUserStore";
import { useAdminProductStore } from "./AdminProductStore";
import { useAdminDistributorStore } from "./AdminDistributorStore"; // Added this

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  useRealSession: boolean;
  _hasHydrated: boolean; // 🔹 Add this
  setHasHydrated: (state: boolean) => void; // 🔹 Add this
  setAuth: (user: User, token: string, isReal: boolean) => void;
  logout: () => void;
}

const INITIAL_STATE = {
  user: null,
  token: null,
  isAuthenticated: false,
  useRealSession: false,
  _hasHydrated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setAuth: (user, token, useRealSession) => {
        set({ user, token, isAuthenticated: true, useRealSession });
        document.cookie = `access_token=${token}; path=/; max-age=43200; SameSite=Lax`;
      },

      logout: () => {
        // Reset ALL stores to prevent data persistence across users
        useSalesStore.getState().reset();
        useDashboardStore.getState().reset();
        useInventoryStore.getState().reset();
        usePurchaseStore.getState().reset();
        useVendorStore.getState().reset();
        useVisitStore.getState().reset();
        useAdminUserStore.getState().reset();
        useAdminProductStore.getState().reset();
        useAdminDistributorStore.getState().reset(); // Added reset

        set(INITIAL_STATE);

        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        localStorage.clear();

        window.location.href = "/login";
      },
    }),
    {
      name: "suivicom-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
