import { create } from "zustand";
import api from "@/services/api";

interface VendorState {
  vendors: any[];
  isLoading: boolean;
  filters: { distributor_id: string; search: string; vendor_type: string };
  setFilters: (filters: Partial<VendorState["filters"]>) => void;
  fetchVendors: () => Promise<void>;
  createVendor: (data: any) => Promise<boolean>;
  updateVendor: (id: number, data: any) => Promise<boolean>;
  deleteVendor: (id: number) => Promise<{ success: boolean; message?: string }>;
}

export const useVendorStore = create<VendorState>((set, get) => ({
  vendors: [],
  isLoading: false,
  filters: { distributor_id: "all", search: "", vendor_type: "all" },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchVendors();
  },

  fetchVendors: async () => {
    set({ isLoading: true });
    const { filters } = get();
    try {
      const res = await api.get("/vendors", {
        params: {
          distributor_id:
            filters.distributor_id === "all"
              ? undefined
              : filters.distributor_id,
          search: filters.search || undefined,
          vendor_type:
            filters.vendor_type === "all" ? undefined : filters.vendor_type,
        },
      });
      set({ vendors: res.data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  createVendor: async (data) => {
    try {
      await api.post("/vendors", data);
      get().fetchVendors();
      return true;
    } catch (err) {
      return false;
    }
  },

  updateVendor: async (id, data) => {
    try {
      await api.put(`/vendors/${id}`, data);
      get().fetchVendors();
      return true;
    } catch (err) {
      return false;
    }
  },

  deleteVendor: async (id) => {
    try {
      await api.delete(`/vendors/${id}`);
      get().fetchVendors();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || "Erreur lors de la suppression",
      };
    }
  },
}));
