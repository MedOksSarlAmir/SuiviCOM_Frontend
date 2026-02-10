import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";

interface UserFilters {
  search: string;
  role: string;
}

interface AdminUserState {
  users: any[];
  total: number;
  page: number;
  limit: number;
  filters: UserFilters;
  isLoading: boolean;

  setPage: (page: number) => void;
  setFilters: (filters: Partial<UserFilters>) => void;
  fetchUsers: () => Promise<void>;
  createUser: (data: any) => Promise<boolean>;
  updateUser: (id: number, data: any) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  reset: () => void;
}

const INITIAL_STATE = {
  users: [],
  total: 0,
  page: 1,
  limit: 10,
  filters: { search: "", role: "all" },
  isLoading: false,
};

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  ...INITIAL_STATE,

  setPage: (page) => {
    set({ page });
    get().fetchUsers();
  },

  setFilters: (newFilters) => {
    set((s) => ({ filters: { ...s.filters, ...newFilters }, page: 1 }));
    get().fetchUsers();
  },

  fetchUsers: async () => {
    set({ isLoading: true });
    const { page, limit, filters } = get();
    try {
      const res = await api.get("/admin/users", {
        params: {
          page,
          pageSize: limit,
          search: filters.search || undefined,
          role: filters.role === "all" ? undefined : filters.role,
        },
      });
      set({
        users: res.data.data,
        total: res.data.total,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      toast.error("Erreur chargement utilisateurs");
    }
  },

  createUser: async (data) => {
    try {
      // Map UI names to Backend names
      const payload = {
        ...data,
        last_name: data.nom,
        first_name: data.prenom,
      };
      await api.post("/admin/users", payload);
      toast.success("Utilisateur créé");
      get().fetchUsers();
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de création");
      return false;
    }
  },

  updateUser: async (id, data) => {
    try {
      // Map UI names to Backend names
      const payload = {
        ...data,
        last_name: data.nom,
        first_name: data.prenom,
      };
      await api.put(`/admin/users/${id}`, payload);
      toast.success("Utilisateur mis à jour");
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
      toast.error(err.response?.data?.message || "Suppression impossible");
      return false;
    }
  },

  reset: () => set(INITIAL_STATE),
}));
