import { create } from "zustand";
import api from "@/services/api";

export interface SaleProduct {
  product_id: number;
  designation: string; // Product name
  quantity: number;
}

export interface Sale {
  id: number;
  date: string;
  distributeur_id: number;
  distributeur_nom: string;
  vendeur_id: number;
  vendeur_nom: string;
  vendeur_prenom: string;
  status: string;
  products: any; // Will be parsed from JSON string
}

interface SalesState {
  sales: Sale[];
  products: any[];
  distributors: any[];
  vendorsCache: Record<number, any[]>;
  currentVendors: any[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  isDependenciesLoaded: boolean;
  isLoadingDeps: boolean;
  filters: {
    startDate?: string;
    endDate?: string;
    search?: string;
    status?: string;
    distributeur_id?: string;
  };
  setLimit: (limit: number) => void;
  setFilters: (filters: Partial<SalesState["filters"]>) => void;
  setPage: (page: number) => void;
  fetchSales: () => Promise<void>;
  fetchDependencies: () => Promise<void>;
  fetchVendorsByDistributor: (distributorId: number) => Promise<void>;
  createSale: (data: any) => Promise<boolean>;
  updateSale: (id: number, data: any) => Promise<boolean>;
  deleteSale: (id: number) => Promise<void>;
  resetSales: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  sales: [],
  products: [],
  distributors: [],
  vendorsCache: {},
  currentVendors: [],
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  isDependenciesLoaded: false,
  filters: {},
  isLoadingDeps: false,
};

export const useSalesStore = create<SalesState>((set, get) => ({
  ...INITIAL_STATE,

  resetSales: () =>
    set({
      sales: [],
      total: 0,
      page: 1,
      isLoading: false,
    }),

  setLimit: (limit) => {
    set({ limit, page: 1 });
    get().fetchSales();
  },
  setPage: (page) => {
    set({ page });
    get().fetchSales();
  },
  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters }, page: 1 }));
    get().fetchSales();
  },

  fetchDependencies: async () => {
    const { isDependenciesLoaded, isLoadingDeps } = get();
    if (isDependenciesLoaded || isLoadingDeps) return;

    set({ isLoadingDeps: true }); // Prevent double-firing
    try {
      const [pRes, dRes] = await Promise.all([
        api.get("/supervisor/products"),
        api.get("/supervisor/distributors"),
      ]);
      set({
        products: pRes.data,
        distributors: dRes.data,
        isDependenciesLoaded: true,
        isLoadingDeps: false,
      });
    } catch (err) {
      set({ isLoadingDeps: false });
    }
  },

  fetchVendorsByDistributor: async (id) => {
    if (get().vendorsCache[id]) {
      set({ currentVendors: get().vendorsCache[id] });
      return;
    }
    try {
      const res = await api.get(`/supervisor/vendors/distributor/${id}`);
      set((state) => ({
        vendorsCache: { ...state.vendorsCache, [id]: res.data },
        currentVendors: res.data,
      }));
    } catch (err) {
      set({ currentVendors: [] });
    }
  },

  fetchSales: async () => {
    set({ isLoading: true });
    const { page, limit, filters } = get();
    try {
      const res = await api.get("/sales", {
        params: {
          page,
          pageSize: limit, // Explicitly match Python kwarg
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
      set({ sales: res.data.data, total: res.data.total, isLoading: false });
    } catch (err) {
      set({ isLoading: false, sales: [] });
    }
  },

  createSale: async (data) => {
    try {
      await api.post("/sales", data);
      get().fetchSales();
      return true;
    } catch (err) {
      return false;
    }
  },

  updateSale: async (id, data) => {
    try {
      await api.put(`/sales/${id}`, data);
      get().fetchSales();
      return true;
    } catch (err) {
      return false;
    }
  },

  deleteSale: async (id) => {
    try {
      await api.delete(`/sales/${id}`);
      get().fetchSales();
    } catch (err) {
      console.error(err);
    }
  },
  reset: () => set(INITIAL_STATE),
}));
