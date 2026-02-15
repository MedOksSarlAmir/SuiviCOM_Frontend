import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";
import { User } from "@/types/auth";

interface DistributorFilters {
  search: string;
  status: string;
  wilaya_id: string;
  supervisor_id: string; // Used for filtering the list by one supervisor
}

interface Supervisor extends User {
  id: number;
  name: string;
  zone_id?: number;
}

interface AdminDistributorState {
  distributors: any[];
  total: number;
  page: number;
  isLoading: boolean;
  filters: DistributorFilters;
  limit: number;
  supervisors: Supervisor[];

  fetchSupervisors: () => Promise<void>;
  fetchDistributors: () => Promise<void>;
  setPage: (p: number) => void;
  setLimit: (p: number) => void;
  setFilters: (f: Partial<DistributorFilters>) => void;

  // Updated to reflect Many-to-Many
  createDistributor: (data: {
    name: string;
    wilaya_id: number;
    address?: string;
    supervisor_ids: number[]; // Changed from supervisor_id
  }) => Promise<boolean>;

  updateDistributor: (
    id: number,
    data: {
      name: string;
      wilaya_id: number;
      active: boolean;
      address?: string;
      supervisor_ids: number[]; // Changed from supervisor_id
    },
  ) => Promise<boolean>;

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
        // Backend returns { data: [...] }
        set({ supervisors: res.data.data, isLoading: false });
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
            pageSize: limit,
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
        // distributors items now contain a "supervisors" array instead of "supervisor_name"
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
        // Backend now expects supervisor_ids (array)
        await api.post("/admin/distributors", data);
        get().fetchDistributors();
        toast.success("Distributeur créé");
        return true;
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Erreur de création");
        return false;
      }
    },

    updateDistributor: async (id, data) => {
      try {
        // Backend handles supervisor_ids array syncing
        await api.put(`/admin/distributors/${id}`, data);
        get().fetchDistributors();
        toast.success("Mise à jour réussie");
        return true;
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Erreur de mise à jour");
        return false;
      }
    },

    bulkReassign: async (ids, supervisorId) => {
      try {
        // Backend "bulk-reassign" now adds the supervisor to the list
        await api.post("/admin/distributors/bulk-reassign", {
          distributor_ids: ids,
          supervisor_id: supervisorId,
        });
        get().fetchDistributors();
        toast.success("Superviseur ajouté aux distributeurs sélectionnés");
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
      set({ limit, page: 1 });
      get().fetchDistributors();
    },
    setFilters: (f) => {
      set({ filters: { ...get().filters, ...f }, page: 1 });
      get().fetchDistributors();
    },
    reset: () => set({ distributors: [], total: 0, page: 1, supervisors: [] }),
  }),
);
