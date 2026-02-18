import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types/auth";
import { useSalesStore } from "./supervisor/SaleStore";
import { useDashboardStore } from "./supervisor/DashboardStore";
import { useInventoryStore } from "./supervisor/InventoryStore";
import { usePurchaseStore } from "./supervisor/PurchaseStore";
import { useVendorStore } from "./supervisor/VendorStore";
import { useVisitStore } from "./supervisor/VisitStore";
import { useAdminUserStore } from "./admin/UserStore";
import { useAdminProductStore } from "./admin/ProductStore";
import { useAdminDistributorStore } from "./admin/DistributorStore"; // Added this
import { useObjectiveStore } from "./supervisor/ObjectiveStore";

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
        useObjectiveStore.getState().resetMatrix();

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
