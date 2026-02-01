import { create } from "zustand";
import api from "@/services/api";

interface InventoryState {
  items: any[];
  total: number;
  isLoading: boolean;

  page: number;
  limit: number;

  filters: {
    distributor_id?: string;
    search?: string;
  };

  // History State
  history: any[];
  historyTotal: number;
  historyPage: number;
  isLoadingHistory: boolean;

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: Partial<InventoryState["filters"]>) => void;

  fetchInventory: () => Promise<void>;

  fetchHistory: (
    distId: number,
    prodId: number,
    reset?: boolean,
  ) => Promise<void>;
  createAdjustment: (data: any) => Promise<boolean>;
  deleteAdjustment: (id: number) => Promise<boolean>;
  refreshGlobalInventory: () => Promise<boolean>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  items: [],
  total: 0,
  isLoading: false,

  page: 1,
  limit: 20,

  filters: {
    distributor_id: "",
    search: "",
  },

  history: [],
  historyTotal: 0,
  historyPage: 1,
  isLoadingHistory: false,

  setPage: (page) => {
    set({ page });
    get().fetchInventory();
  },

  setLimit: (limit) => {
    set({ limit, page: 1 });
    get().fetchInventory();
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      page: 1,
    }));
    get().fetchInventory();
  },

  fetchInventory: async () => {
    const { page, limit, filters } = get();

    if (!filters.distributor_id) return; // wait until set

    set({ isLoading: true });

    try {
      const res = await api.get(`/inventory/${filters.distributor_id}`, {
        params: {
          search: filters.search || undefined,
          page,
          pageSize: limit,
        },
      });

      set({
        items: res.data.data,
        total: res.data.total,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, items: [] });
    }
  },

  fetchHistory: async (distId, prodId, reset = false) => {
    const pageToFetch = reset ? 1 : get().historyPage;
    set({ isLoadingHistory: true });

    try {
      const res = await api.get(`/inventory/history/${distId}/${prodId}`, {
        params: { page: pageToFetch, pageSize: 10 },
      });

      set((state) => ({
        history: reset ? res.data.data : [...state.history, ...res.data.data],
        historyTotal: res.data.total,
        historyPage: pageToFetch + 1,
        isLoadingHistory: false,
      }));
    } catch {
      set({ isLoadingHistory: false });
    }
  },

  createAdjustment: async (data) => {
    try {
      await api.post(`/inventory/adjust/${data.product_id}`, data);
      get().fetchInventory();
      return true;
    } catch {
      return false;
    }
  },

  deleteAdjustment: async (id) => {
    try {
      await api.delete(`/inventory/adjust/${id}`);
      get().fetchInventory();
      return true;
    } catch {
      return false;
    }
  },

  refreshGlobalInventory: async () => {
    try {
      await api.post("/inventory/refresh");
      get().fetchInventory();
      return true;
    } catch {
      return false;
    }
  },
}));
