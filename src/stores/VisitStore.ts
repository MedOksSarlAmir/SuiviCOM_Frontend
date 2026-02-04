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
  visits: any[];
  total: number;
  isLoading: boolean;
  page: number;
  limit: number;
  filters: {
    startDate?: string;
    endDate?: string;
    search?: string;
    distributeur_id?: string;
  };
  isErrorCell: Record<string, boolean>;
  matrixData: VisitMatrixItem[];
  isSavingCell: Record<string, boolean>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: Partial<VisitState["filters"]>) => void;
  fetchVisits: () => Promise<void>;
  fetchVisitMatrix: (params: any) => Promise<void>;
  upsertVisitCell: (payload: any) => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE = {
  visits: [],
  matrixData: [],
  isSavingCell: {},
  total: 0,
  isLoading: false,
  page: 1,
  limit: 20,
  isErrorCell: {},
  filters: { distributeur_id: "all" },
};

export const useVisitStore = create<VisitState>((set, get) => ({
  ...INITIAL_STATE,

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
      isErrorCell: { ...state.isErrorCell, [cellKey]: false },
    }));
    try {
      await api.post("/visits/upsert", payload);
      const { matrixData } = get();
      const newData = matrixData.map((v) =>
        v.vendor_id === vendor_id ? { ...v, [field]: value } : v,
      );
      set({ matrixData: newData });
      toast.success("Donnée visite mise à jour", { duration: 1500 });
    } catch {
      set((state) => ({
        isErrorCell: { ...state.isErrorCell, [cellKey]: true },
      }));
      toast.error("Erreur de sauvegarde visite");
    } finally {
      set((state) => ({
        isSavingCell: { ...state.isSavingCell, [cellKey]: false },
      }));
    }
  },

  reset: () => set(INITIAL_STATE),
}));
