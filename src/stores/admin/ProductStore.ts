import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";

interface ProductFilters {
  search: string;
  category_id: string;
  type_id: string;
  order_by: string;
}

interface AdminProductState {
  products: any[];
  total: number;
  page: number;
  limit: number;
  filters: ProductFilters;
  metadata: { categories: any[]; types: any[] };
  isLoading: boolean;

  setPage: (page: number) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  fetchProducts: () => Promise<void>;
  fetchMetadata: () => Promise<void>;
  createProduct: (data: any) => Promise<boolean>;
  updateProduct: (id: number, data: any) => Promise<boolean>;
  reset: () => void;
}

const INITIAL_STATE = {
  products: [],
  total: 0,
  page: 1,
  limit: 20,
  filters: {
    search: "",
    category_id: "all",
    type_id: "all",
    order_by: "date",
  },
  metadata: { categories: [], types: [] },
  isLoading: false,
};

export const useAdminProductStore = create<AdminProductState>((set, get) => ({
  ...INITIAL_STATE,

  setPage: (page) => {
    set({ page });
    get().fetchProducts();
  },

  setFilters: (newFilters) => {
    set((s) => ({ filters: { ...s.filters, ...newFilters }, page: 1 }));
    get().fetchProducts();
  },

  fetchProducts: async () => {
    set({ isLoading: true });
    const { page, limit, filters } = get();
    try {
      const res = await api.get("/admin/products", {
        params: {
          page,
          pageSize: limit,
          search: filters.search || undefined,
          category_id:
            filters.category_id === "all" ? undefined : filters.category_id,
          type_id: filters.type_id === "all" ? undefined : filters.type_id,
          order_by: filters.order_by,
        },
      });

      set({ products: res.data.data, total: res.data.total, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchMetadata: async () => {
    try {
      // Changed to the new shared route
      const res = await api.get("/shared/admin-metadata");
      set({
        metadata: {
          categories: res.data.categories,
          types: res.data.product_types, // Backend returns product_types
        },
      });
    } catch {
      console.error("Failed to load metadata");
    }
  },

  createProduct: async (data) => {
    try {
      await api.post("/admin/products", data);
      toast.success("Produit créé");
      get().fetchProducts();
      return true;
    } catch {
      return false;
    }
  },

  updateProduct: async (id, data) => {
    try {
      await api.put(`/admin/products/${id}`, data);
      toast.success("Produit mis à jour");
      get().fetchProducts();
      return true;
    } catch {
      return false;
    }
  },

  reset: () => set(INITIAL_STATE),
}));
