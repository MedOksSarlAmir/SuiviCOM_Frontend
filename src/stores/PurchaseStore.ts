import { create } from "zustand";
import api from "@/services/api";

export interface PurchaseItem {
  product_id: number;
  designation: string;
  quantity: number;
}

export interface Purchase {
  id: number;
  date: string;
  distributeur_id: number;
  distributeur_nom: string;
  status: string;
  products: PurchaseItem[];
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
      set({
        products: pRes.data,
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
      set({
        purchases: res.data.data,
        total: res.data.total,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, purchases: [] });
    }
  },

  createPurchase: async (data) => {
    try {
      await api.post("/purchases", data);
      get().fetchPurchases();
      return true;
    } catch (err) {
      return false;
    }
  },

  updatePurchase: async (id, data) => {
    try {
      await api.put(`/purchases/${id}`, data);
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
