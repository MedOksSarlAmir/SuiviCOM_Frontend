import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";

interface VendorState {
  vendors: any[];
  isLoading: boolean;
  filters: { distributor_id: string; search: string; vendor_type: string };
  setFilters: (filters: Partial<VendorState["filters"]>) => void;
  fetchVendors: () => Promise<void>;
  createVendor: (data: any) => Promise<boolean>;
  updateVendor: (id: number, data: any) => Promise<boolean>;
  deleteVendor: (id: number) => Promise<{ success: boolean; message?: string }>;
  reset: () => void;
}

const INITIAL_STATE = {
  vendors: [],
  isLoading: false,
  filters: { distributor_id: "all", search: "", vendor_type: "all" },
};

export const useVendorStore = create<VendorState>((set, get) => ({
  ...INITIAL_STATE,

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchVendors();
  },

  fetchVendors: async () => {
    set({ isLoading: true });
    const { filters } = get();
    try {
      const res = await api.get("/supervisor/vendors", {
        // Prefix added
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

      // Map Backend names to Frontend "nom/prenom"
      const mappedVendors = res.data.data.map((v: any) => ({
        ...v,
        nom: v.last_name,
        prenom: v.first_name,
        vendor_type: v.type, // BE uses 'type', FE uses 'vendor_type'
      }));

      set({ vendors: mappedVendors, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createVendor: async (data) => {
    try {
      // Map UI keys to new BE English keys
      const payload = {
        code: data.code,
        last_name: data.nom,
        first_name: data.prenom,
        type: data.vendor_type,
        distributor_id: data.distributor_id,
      };
      await api.post("/supervisor/vendors", payload); // Prefix added
      toast.success("Vendeur ajouté avec succès");
      get().fetchVendors();
      return true;
    } catch {
      toast.error("Erreur lors de l'ajout du vendeur");
      return false;
    }
  },

  updateVendor: async (id, data) => {
    try {
      // Map UI keys to new BE English keys
      const payload = {
        last_name: data.nom,
        first_name: data.prenom,
        type: data.vendor_type,
        active: data.active,
      };
      await api.put(`/supervisor/vendors/${id}`, payload); // Prefix added
      toast.success("Vendeur mis à jour");
      get().fetchVendors();
      return true;
    } catch {
      toast.error("Erreur lors de la modification");
      return false;
    }
  },

  deleteVendor: async (id) => {
    try {
      await api.delete(`/supervisor/vendors/${id}`); // Prefix added
      toast.success("Vendeur supprimé");
      get().fetchVendors();
      return { success: true };
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Erreur lors de la suppression";
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  reset: () => set(INITIAL_STATE),
}));
