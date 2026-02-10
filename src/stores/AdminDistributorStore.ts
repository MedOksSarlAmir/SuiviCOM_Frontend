import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";

interface AdminDistributorState {
  distributors: any[];
  total: number;
  page: number;
  limit: number;
  filters: { search: string };
  isLoading: boolean;

  setPage: (page: number) => void;
  setFilters: (filters: { search: string }) => void;
  fetchDistributors: () => Promise<void>;
  createDistributor: (data: any) => Promise<boolean>;
  updateDistributor: (id: number, data: any) => Promise<boolean>;
  deleteDistributor: (id: number) => Promise<boolean>;
  reset: () => void;
}

export const useAdminDistributorStore = create<AdminDistributorState>(
  (set, get) => ({
    distributors: [],
    total: 0,
    page: 1,
    limit: 10,
    filters: { search: "" },
    isLoading: false,

    setPage: (page) => {
      set({ page });
      get().fetchDistributors();
    },

    setFilters: (filters) => {
      set({ filters, page: 1 });
      get().fetchDistributors();
    },

    fetchDistributors: async () => {
      set({ isLoading: true });
      const { page, limit, filters } = get();
      try {
        const res = await api.get("/admin/distributors", {
          params: {
            page,
            pageSize: limit,
            search: filters.search || undefined,
          },
        });
        set({
          distributors: res.data.data,
          total: res.data.total,
          isLoading: false,
        });
      } catch {
        set({ isLoading: false });
      }
    },

    createDistributor: async (data) => {
      try {
        const payload = { ...data, name: data.nom };
        await api.post("/admin/distributors", payload);
        toast.success("Distributeur créé");
        get().fetchDistributors();
        return true;
      } catch {
        return false;
      }
    },

    updateDistributor: async (id, data) => {
      try {
        const payload = { ...data, name: data.nom };
        await api.put(`/admin/distributors/${id}`, payload);
        toast.success("Distributeur mis à jour");
        get().fetchDistributors();
        return true;
      } catch {
        return false;
      }
    },

    deleteDistributor: async (id) => {
      try {
        await api.delete(`/admin/distributors/${id}`);
        toast.success("Distributeur supprimé");
        get().fetchDistributors();
        return true;
      } catch {
        return false;
      }
    },

    reset: () => set({ distributors: [], total: 0, page: 1, isLoading: false }),
  }),
);
