import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";

export interface PurchaseItem {
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface Purchase {
  id: number;
  date: string;
  distributeur_id: number;
  distributeur_nom: string;
  status: string;
  products: PurchaseItem[];
  montant_total: number;
}

interface PurchaseState {
  purchases: Purchase[];
  products: any[];
  distributors: any[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  isDependenciesLoaded: boolean;
  filters: {
    startDate?: string;
    endDate?: string;
    search?: string;
    status?: string;
    distributeur_id?: string;
  };
  setLimit: (limit: number) => void;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<PurchaseState["filters"]>) => void;
  fetchPurchases: () => Promise<void>;
  fetchDependencies: () => Promise<void>;
  createPurchase: (data: any) => Promise<boolean>;
  updatePurchase: (id: number, data: any) => Promise<boolean>;
  deletePurchase: (id: number) => Promise<void>;
  matrix: any[];
  matrixTotal: number;
  isMatrixLoading: boolean;
  fetchPurchaseMatrix: (params: any) => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE = {
  purchases: [],
  products: [],
  distributors: [],
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  isDependenciesLoaded: false,
  filters: { status: "all", distributeur_id: "all" },
  matrix: [],
  matrixTotal: 0,
  isMatrixLoading: false,
};

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  ...INITIAL_STATE,

  setLimit: (limit) => {
    set({ limit, page: 1 });
    get().fetchPurchases();
  },
  setPage: (page) => {
    set({ page });
    get().fetchPurchases();
  },
  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters }, page: 1 }));
    get().fetchPurchases();
  },

  fetchDependencies: async () => {
    if (get().isDependenciesLoaded) return;
    try {
      const [pRes, dRes] = await Promise.all([
        api.get("/shared/products"), // Changed to shared
        api.get("/shared/distributors"), // Changed to shared
      ]);
      const products = pRes.data.map((p: any) => ({
        ...p,
        unit_price: p.price_factory,
      }));
      set({ products, distributors: dRes.data, isDependenciesLoaded: true });
    } catch (err) {
      console.error(err);
    }
  },

  fetchPurchases: async () => {
    set({ isLoading: true });
    const { page, limit, filters } = get();
    try {
      const res = await api.get("/supervisor/purchases", {
        // Prefix added
        params: {
          page,
          pageSize: limit,
          search: filters.search,
          status: filters.status,
          startDate: filters.startDate,
          endDate: filters.endDate,
          // Changed parameter name
          distributor_id:
            filters.distributeur_id === "all"
              ? undefined
              : filters.distributeur_id,
        },
      });

      // Map Backend "total_amount" to Frontend "montant_total"
      const purchases = res.data.data.map((p: any) => ({
        ...p,
        montant_total: p.total_amount,
        products: (p.products || []).map((item: any) => ({
          ...item,
          unit_price: item.price_factory || 0,
        })),
      }));
      set({ purchases, total: res.data.total, isLoading: false });
    } catch (err) {
      set({ isLoading: false, purchases: [] });
    }
  },

  createPurchase: async (data) => {
    try {
      const payload = {
        date: data.date,
        distributor_id: data.distributor_id, // Map keys for BE
        status: data.status,
        products: data.products.filter((p: any) => p.quantity > 0),
      };
      await api.post("/supervisor/purchases", payload); // Prefix added
      toast.success("Bon d'achat créé");
      get().fetchPurchases();
      return true;
    } catch {
      toast.error("Erreur de création");
      return false;
    }
  },

  updatePurchase: async (id, data) => {
    try {
      const payload = {
        date: data.date,
        distributor_id: data.distributeurId, // Map keys for BE
        status: data.status,
        products: data.products.map((p: any) => ({
          product_id: p.product_id,
          quantity: p.quantity,
        })),
      };
      await api.put(`/supervisor/purchases/${id}`, payload); // Prefix added
      toast.success("Bon d'achat mis à jour");
      get().fetchPurchases();
      return true;
    } catch {
      toast.error("Erreur de modification");
      return false;
    }
  },

  deletePurchase: async (id) => {
    try {
      if (confirm("Êtes-vous sûr de vouloir supprimer ce bon d'achat ?")) {
        await api.delete(`/supervisor/purchases/${id}`); // Prefix added
        toast.success("Bon d'achat supprimé");
        get().fetchPurchases();
      }
    } catch {
      toast.error("Erreur de suppression");
    }
  },

  fetchPurchaseMatrix: async (params) => {
    set({ isMatrixLoading: true });
    try {
      // Endpoint updated to supervisor prefix
      const res = await api.get("/supervisor/purchases/matrix", { params });
      set({
        matrix: res.data.data,
        matrixTotal: res.data.total,
        isMatrixLoading: false,
      });
    } catch {
      set({ isMatrixLoading: false, matrix: [] });
    }
  },

  reset: () => set(INITIAL_STATE),
}));
