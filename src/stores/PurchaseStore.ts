import { create } from "zustand";
import api from "@/services/api";

export interface PurchaseItem {
  product_id: number;
  designation: string;
  quantity: number;
  unit_price: number; // Always use unit_price in frontend
}

export interface Purchase {
  id: number;
  date: string;
  distributeur_id: number;
  distributeur_nom: string;
  status: string;
  products: PurchaseItem[];
  montant_total: number;
}

interface PurchaseState {
  purchases: Purchase[];
  products: any[];
  distributors: any[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  isDependenciesLoaded: boolean;
  filters: {
    startDate?: string;
    endDate?: string;
    search?: string;
    status?: string;
    distributeur_id?: string;
  };
  setLimit: (limit: number) => void;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<PurchaseState["filters"]>) => void;
  fetchPurchases: () => Promise<void>;
  fetchDependencies: () => Promise<void>;
  createPurchase: (data: any) => Promise<boolean>;
  updatePurchase: (id: number, data: any) => Promise<boolean>;
  deletePurchase: (id: number) => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE = {
  purchases: [],
  products: [],
  distributors: [],
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  isDependenciesLoaded: false,
  filters: { status: "all", distributeur_id: "all" },
};

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  ...INITIAL_STATE,

  setLimit: (limit) => {
    set({ limit, page: 1 });
    get().fetchPurchases();
  },
  setPage: (page) => {
    set({ page });
    get().fetchPurchases();
  },
  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters }, page: 1 }));
    get().fetchPurchases();
  },

  fetchDependencies: async () => {
    if (get().isDependenciesLoaded) return;
    try {
      const [pRes, dRes] = await Promise.all([
        api.get("/supervisor/products"),
        api.get("/supervisor/distributors"),
      ]);

      // Map products to include unit_price for frontend
      const products = pRes.data.map((p: any) => ({
        ...p,
        unit_price: p.price_factory, // map backend price_factory
      }));

      set({
        products,
        distributors: dRes.data,
        isDependenciesLoaded: true,
      });
    } catch (err) {
      console.error(err);
    }
  },

  fetchPurchases: async () => {
    set({ isLoading: true });
    const { page, limit, filters } = get();
    try {
      const res = await api.get("/purchases", {
        params: {
          page,
          pageSize: limit,
          search: filters.search,
          status: filters.status,
          startDate: filters.startDate,
          endDate: filters.endDate,
          distributeur_id:
            filters.distributeur_id === "all"
              ? undefined
              : filters.distributeur_id,
        },
      });

      // Map purchase items to include unit_price
      const purchases = res.data.data.map((p: any) => ({
        ...p,
        products: p.products.map((item: any) => ({
          ...item,
          unit_price: item.price_factory || 0, // map backend field
        })),
      }));

      set({ purchases, total: res.data.total, isLoading: false });
    } catch (err) {
      set({ isLoading: false, purchases: [] });
    }
  },

  createPurchase: async (data) => {
    try {
      // Map products to backend fields
      const payload = {
        ...data,
        products: data.products.map((p: any) => ({
          ...p,
          price_factory: p.unit_price,
        })),
      };
      await api.post("/purchases", payload);
      get().fetchPurchases();
      return true;
    } catch (err) {
      return false;
    }
  },

  updatePurchase: async (id, data) => {
    try {
      const payload = {
        ...data,
        products: data.products.map((p: any) => ({
          ...p,
          price_factory: p.unit_price,
        })),
      };
      await api.put(`/purchases/${id}`, payload);
      get().fetchPurchases();
      return true;
    } catch (err) {
      return false;
    }
  },

  deletePurchase: async (id) => {
    try {
      await api.delete(`/purchases/${id}`);
      get().fetchPurchases();
    } catch (err) {
      console.error(err);
    }
  },

  reset: () => set(INITIAL_STATE),
}));
