import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";

interface DistributorFilters {
  search: string;
  status: string;
  wilaya_id: string;
  supervisor_id: string;
}

interface AdminDistributorState {
  distributors: any[];
  total: number;
  page: number;
  isLoading: boolean;
  filters: DistributorFilters;
  limit: number;

  supervisors: any[];

  fetchSupervisors: () => Promise<void>;

  fetchDistributors: () => Promise<void>;
  setPage: (p: number) => void;
  setLimit: (p: number) => void;
  setFilters: (f: Partial<DistributorFilters>) => void;

  createDistributor: (data: any) => Promise<boolean>;
  updateDistributor: (id: number, data: any) => Promise<boolean>;
  bulkReassign: (ids: number[], supervisorId: number) => Promise<boolean>;
  reset: () => void;
}

export const useAdminDistributorStore = create<AdminDistributorState>(
  (set, get) => ({
    distributors: [],
    total: 0,
    page: 1,
    isLoading: false,
    filters: {
      search: "",
      status: "all",
      wilaya_id: "all",
      supervisor_id: "all",
    },
    limit: 20,

    supervisors: [],

    fetchSupervisors: async () => {
      set({ isLoading: true });
      try {
        const res = await api.get("/admin/distributors/supervisors");
        set({
          supervisors: res.data.data,
          isLoading: false,
        });
      } catch {
        set({ isLoading: false });
      }
    },

    fetchDistributors: async () => {
      set({ isLoading: true });
      try {
        const { page, filters, limit } = get();
        const res = await api.get("/admin/distributors", {
          params: {
            page,
            pageSize: 10,
            limit,
            search: filters.search || undefined,
            status: filters.status,
            wilaya_id:
              filters.wilaya_id === "all" ? undefined : filters.wilaya_id,
            supervisor_id:
              filters.supervisor_id === "all"
                ? undefined
                : filters.supervisor_id,
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
        await api.post("/admin/distributors", data);
        get().fetchDistributors();
        toast.success("Distributeur créé");
        return true;
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Erreur");
        return false;
      }
    },

    updateDistributor: async (id, data) => {
      try {
        await api.put(`/admin/distributors/${id}`, data);
        get().fetchDistributors();
        toast.success("Mise à jour réussie");
        return true;
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Erreur");
        return false;
      }
    },

    bulkReassign: async (ids, supervisorId) => {
      try {
        await api.post("/admin/distributors/bulk-reassign", {
          distributor_ids: ids,
          supervisor_id: supervisorId,
        });
        get().fetchDistributors();
        toast.success("Réassignation terminée");
        return true;
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Échec");
        return false;
      }
    },

    setPage: (page) => {
      set({ page });
      get().fetchDistributors();
    },
    setLimit: (limit) => {
      set({ limit });
      get().fetchDistributors();
    },
    setFilters: (f) => {
      set({ filters: { ...get().filters, ...f }, page: 1 });
      get().fetchDistributors();
    },
    reset: () => set({ distributors: [], total: 0, page: 1 }),
  }),
);
