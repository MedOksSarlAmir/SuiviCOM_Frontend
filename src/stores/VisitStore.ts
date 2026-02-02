import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";

interface VisitMatrixItem {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  vendor_type: string;
  prog: number;
  done: number;
  invoices: number;
  visit_id: number | null;
}

interface VisitState {
  // Standard State
  visits: any[];
  total: number;
  isLoading: boolean;
  page: number;
  limit: number;
  filters: {
    startDate?: string;
    endDate?: string;
    search?: string;
    status?: string;
    distributeur_id?: string;
  };
  isErrorCell: Record<string, boolean>; // key: "vendorId-field"

  // Matrix State
  matrixData: VisitMatrixItem[];
  isSavingCell: Record<string, boolean>; // key: "vendorId-field"

  // Actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: Partial<VisitState["filters"]>) => void;
  fetchVisits: () => Promise<void>;

  // Matrix Actions
  fetchVisitMatrix: (params: {
    distributor_id: string;
    date: string;
    search?: string;
    vendor_type?: string;
    page?: number;
  }) => Promise<void>;

  upsertVisitCell: (payload: {
    vendor_id: number;
    date: string;
    field: "prog" | "done" | "invoices";
    value: number;
  }) => Promise<void>;

  reset: () => void;
}

export const useVisitStore = create<VisitState>((set, get) => ({
  visits: [],
  matrixData: [],
  isSavingCell: {},
  total: 0,
  isLoading: false,
  page: 1,
  isErrorCell: {},

  limit: 20,
  filters: { status: "all", distributeur_id: "all" },

  setPage: (page) => {
    set({ page });
    get().fetchVisits();
  },
  setLimit: (limit) => {
    set({ limit, page: 1 });
    get().fetchVisits();
  },
  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters }, page: 1 }));
    get().fetchVisits();
  },

  fetchVisits: async () => {
    set({ isLoading: true });
    const { page, limit, filters } = get();
    try {
      const res = await api.get("/visits", {
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
      set({ visits: res.data.data, total: res.data.total, isLoading: false });
    } catch {
      set({ isLoading: false, visits: [] });
    }
  },

  fetchVisitMatrix: async (params) => {
    set({ isLoading: true });
    try {
      const res = await api.get("/visits/matrix", {
        params: { ...params, pageSize: 25 },
      });
      set({
        matrixData: res.data.data,
        total: res.data.total,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, matrixData: [] });
    }
  },

  upsertVisitCell: async (payload) => {
    const { vendor_id, field, value } = payload;
    const cellKey = `${vendor_id}-${field}`;

    set((state) => ({
      isSavingCell: { ...state.isSavingCell, [cellKey]: true },
      isErrorCell: { ...state.isErrorCell, [cellKey]: false }, // Clear previous error on attempt
    }));

    try {
      await api.post("/visits/upsert", payload);

      const { matrixData } = get();
      const newData = matrixData.map((v) =>
        v.vendor_id === vendor_id ? { ...v, [field]: value } : v,
      );

      set({ matrixData: newData });
      // No toast on success to reduce noise, or keep it very short
    } catch (err) {
      // Set error state for this specific cell
      set((state) => ({
        isErrorCell: { ...state.isErrorCell, [cellKey]: true },
      }));
      toast.error("Erreur de sauvegarde");
    } finally {
      set((state) => ({
        isSavingCell: { ...state.isSavingCell, [cellKey]: false },
      }));
    }
  },

  reset: () => set({ matrixData: [], visits: [], total: 0, isSavingCell: {}, isErrorCell: {} }),
}));
