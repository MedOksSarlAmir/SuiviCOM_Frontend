import { create } from "zustand";
import api from "@/services/api";

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
    status?: string;
    distributeur_id?: string;
  };
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: Partial<VisitState["filters"]>) => void;
  fetchVisits: () => Promise<void>;
  createVisit: (data: any) => Promise<boolean>;
  updateVisit: (id: number, data: any) => Promise<boolean>;
  deleteVisit: (id: number) => Promise<boolean>;
}

export const useVisitStore = create<VisitState>((set, get) => ({
  visits: [],
  total: 0,
  isLoading: false,
  page: 1,
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
    } catch (err) {
      set({ isLoading: false, visits: [] });
    }
  },

  createVisit: async (data) => {
    try {
      await api.post("/visits", data);
      get().fetchVisits();
      return true;
    } catch {
      return false;
    }
  },

  updateVisit: async (id, data) => {
    try {
      await api.put(`/visits/${id}`, data);
      get().fetchVisits();
      return true;
    } catch {
      return false;
    }
  },

  deleteVisit: async (id) => {
    try {
      await api.delete(`/visits/${id}`);
      get().fetchVisits();
      return true;
    } catch {
      return false;
    }
  },
}));
