// src/stores/InventoryStore.ts
import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";

interface InventoryState {
  items: any[];
  total: number;
  isLoading: boolean;
  page: number;
  limit: number;
  filters: { distributor_id?: string; search?: string };
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
    historyFilters?: {
      type?: string;
      vendor_id?: number;
      startDate?: string;
      endDate?: string;
    },
  ) => Promise<void>;

  // Real Inventory Actions
  updatePhysicalStock: (prodId: number, qty: number) => Promise<void>;

  createAdjustment: (data: any) => Promise<boolean>;
  deleteAdjustment: (id: number) => Promise<boolean>;
  refreshGlobalInventory: () => Promise<boolean>;
  reset: () => void;
}

const INITIAL_STATE = {
  items: [],
  total: 0,
  isLoading: false,
  page: 1,
  limit: 20,
  filters: { distributor_id: "", search: "" },
  history: [],
  historyTotal: 0,
  historyPage: 1,
  isLoadingHistory: false,
};

export const useInventoryStore = create<InventoryState>((set, get) => ({
  ...INITIAL_STATE,

  setPage: (page) => {
    set({ page });
    get().fetchInventory();
  },
  setLimit: (limit) => {
    set({ limit, page: 1 });
    get().fetchInventory();
  },
  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters }, page: 1 }));
    get().fetchInventory();
  },

  fetchInventory: async () => {
    const { page, limit, filters } = get();
    if (!filters.distributor_id) return;
    set({ isLoading: true });
    try {
      const res = await api.get(`/supervisor/inventory/stock`, {
        params: {
          distributor_id: filters.distributor_id,
          search: filters.search || undefined,
          page,
          pageSize: limit,
        },
      });
      // We map the backend response to maintain the naming expected by components
      const items = res.data.data.map((item: any) => ({
        ...item,
        name: item.product_name,
        // theoretical_qty is the 'stock' from logic
        stock: item.theoretical_qty,
        // physical_qty comes directly from the new DB table
        physical_qty: item.physical_qty || 0,
      }));
      set({ items, total: res.data.total, isLoading: false });
    } catch {
      set({ isLoading: false, items: [] });
    }
  },

  fetchHistory: async (distId, prodId, reset = false, historyFilters = {}) => {
    const pageToFetch = reset ? 1 : get().historyPage;
    set({ isLoadingHistory: true });
    try {
      const res = await api.get(
        `/supervisor/inventory/history/${distId}/${prodId}`,
        {
          params: {
            page: pageToFetch,
            pageSize: 10,
            ...historyFilters, // Inject type, vendor_id, startDate, endDate
          },
        },
      );

      const historyData = res.data.data.map((h: any) => ({
        ...h,
        qte: h.quantity,
      }));

      set((state) => ({
        history: reset ? historyData : [...state.history, ...historyData],
        historyTotal: res.data.total,
        historyPage: reset ? 2 : pageToFetch + 1, // Set to 2 if reset
        isLoadingHistory: false,
      }));
    } catch {
      set({ isLoadingHistory: false });
    }
  },

  updatePhysicalStock: async (prodId: number, qty: number) => {
    const { filters } = get();
    try {
      await api.post("/supervisor/inventory/physical", {
        distributor_id: parseInt(filters.distributor_id!),
        product_id: prodId,
        quantity: qty,
      });
      toast.success("Stock physique mis à jour");
      // Sync local state to update the "Ecart" immediately
      set((state) => ({
        items: state.items.map((item) =>
          item.product_id === prodId ? { ...item, physical_qty: qty } : item,
        ),
      }));
    } catch (err: any) {
      toast.error(
        "Erreur de sauvegarde de l'inventaire physique: " +
          (err.response?.data?.message || "Erreur inconnue"),
      );
    }
  },

  createAdjustment: async (data) => {
    try {
      await api.post(`/supervisor/inventory/adjust`, data);
      toast.success("Ajustement de stock enregistré");
      get().fetchInventory();
      return true;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'ajustement",
      );
      return false;
    }
  },

  deleteAdjustment: async (id) => {
    try {
      await api.delete(`/supervisor/inventory/adjust/${id}`);
      toast.success("Ajustement supprimé");
      get().fetchInventory();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur de suppression");
      return false;
    }
  },

  refreshGlobalInventory: async () => {
    try {
      await api.post("/supervisor/inventory/refresh");
      toast.success("Inventaire global synchronisé");
      get().fetchInventory();
      return true;
    } catch (error: any) {
      toast.error("Erreur de synchronisation");
      return false;
    }
  },

  reset: () => set(INITIAL_STATE),
}));
