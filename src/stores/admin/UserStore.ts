import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";

interface AdminUserState {
  users: any[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  filters: { search: string; role: string };

  fetchUsers: () => Promise<void>;
  setPage: (p: number) => void;
  setFilters: (f: any) => void;
  createUser: (data: any) => Promise<boolean>;
  updateUser: (id: number, data: any) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  reset: () => void;
}

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  users: [],
  total: 0,
  page: 1,
  limit: 10,
  isLoading: false,
  filters: { search: "", role: "all" },

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const { page, limit, filters } = get();
      const res = await api.get("/admin/users", {
        params: {
          page,
          pageSize: limit,
          search: filters.search || undefined,
          role: filters.role === "all" ? undefined : filters.role,
        },
      });
      set({ users: res.data.data, total: res.data.total, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createUser: async (data) => {
    try {
      await api.post("/admin/users", data);
      toast.success("Utilisateur créé avec succès");
      get().fetchUsers();
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de création");
      return false;
    }
  },

  updateUser: async (id, data) => {
    try {
      await api.put(`/admin/users/${id}`, data);
      toast.success("Modification enregistrée");
      get().fetchUsers();
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de modification");
      return false;
    }
  },

  deleteUser: async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("Utilisateur supprimé");
      get().fetchUsers();
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action impossible");
      return false;
    }
  },

  setPage: (page) => {
    set({ page });
    get().fetchUsers();
  },
  setFilters: (f) => {
    set({ filters: { ...get().filters, ...f }, page: 1 });
    get().fetchUsers();
  },
  reset: () => set({ users: [], total: 0, page: 1, isLoading: false }),
}));
