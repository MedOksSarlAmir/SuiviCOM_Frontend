import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";

export interface CategoryWithFormats {
  id: number;
  name: string;
  formats: string[];
}

export interface WeeklyProduct {
  product_id: number;
  name: string;
  code: string;
  active: boolean;
  price: number;
  days: number[];
}

// Utility to find the nearest Saturday (Start of the selling week)
const getSaturday = (selectedDate: Date) => {
  const d = new Date(selectedDate);
  const day = d.getDay();
  const diff = day === 6 ? 0 : -(day + 1);
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
};

interface SalesFilters {
  distributor_id: string;
  vendor_id: string;
  start_date: string;
  category: string;
  format: string;
  product_type: string;
  search: string;
  page: number;
}

interface SalesState {
  // Data
  weeklyData: WeeklyProduct[];
  weeklyDates: string[];
  weeklyStatuses: Record<string, string>;
  total: number;
  isLoading: boolean;

  // Lookups
  distributors: any[];
  currentVendors: any[];
  categories: CategoryWithFormats[];
  productTypes: any[];
  vendorsCache: Record<number, any[]>;

  // UI State
  isSavingCell: Record<string, boolean>;
  isErrorCell: Record<string, boolean>;
  isDependenciesLoaded: boolean;

  // Filters (Persisted in store)
  filters: SalesFilters;

  // Actions
  setFilters: (filters: Partial<SalesFilters>) => void;
  fetchDependencies: () => Promise<void>;
  fetchVendorsByDistributor: (id: number) => Promise<void>;
  fetchWeeklyMatrix: (params: SalesFilters) => Promise<void>;
  upsertSaleItem: (payload: any) => Promise<void>;
  updateSaleStatus: (payload: any) => Promise<void>;
  reset: () => void;
}

const INITIAL_FILTERS: SalesFilters = {
  distributor_id: "",
  vendor_id: "",
  start_date: getSaturday(new Date()),
  category: "all",
  format: "all",
  product_type: "all",
  search: "",
  page: 1,
};

const INITIAL_STATE = {
  weeklyData: [],
  weeklyDates: [],
  weeklyStatuses: {},
  isSavingCell: {},
  isErrorCell: {},
  total: 0,
  isLoading: false,
  distributors: [],
  currentVendors: [],
  categories: [],
  productTypes: [],
  vendorsCache: {},
  isDependenciesLoaded: false,
};

export const useSalesStore = create<SalesState>((set, get) => ({
  ...INITIAL_STATE,
  filters: INITIAL_FILTERS,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  fetchDependencies: async () => {
    // Only fetch metadata once
    if (!get().isDependenciesLoaded) {
      try {
        const [dRes, cRes, tRes] = await Promise.all([
          api.get("/shared/distributors"),
          api.get("/shared/categories-with-formats"),
          api.get("/shared/admin-metadata"),
        ]);

        set({
          distributors: dRes.data,
          categories: cRes.data,
          productTypes: tRes.data.product_types,
          isDependenciesLoaded: true,
        });

        // AUTO-SELECT FIRST DISTRIBUTOR if none is selected
        const currentFilters = get().filters;
        if (!currentFilters.distributor_id && dRes.data.length > 0) {
          const firstDistId = dRes.data[0].id.toString();
          get().setFilters({ distributor_id: firstDistId });
          get().fetchVendorsByDistributor(parseInt(firstDistId));
        }
      } catch (err) {
        console.error("Failed to fetch dependencies", err);
      }
    }
  },

  fetchVendorsByDistributor: async (id) => {
    const updateVendorSelection = (vendors: any[]) => {
      const currentVendorId = get().filters.vendor_id;
      // If no vendor selected, or current vendor doesn't belong to this distributor, select the first one
      const isValid = vendors.some((v) => v.id.toString() === currentVendorId);
      if ((!currentVendorId || !isValid) && vendors.length > 0) {
        get().setFilters({ vendor_id: vendors[0].id.toString() });
      }
    };

    if (get().vendorsCache[id]) {
      const cached = get().vendorsCache[id];
      set({ currentVendors: cached });
      updateVendorSelection(cached);
      return;
    }

    try {
      const res = await api.get(`/shared/vendors/distributor/${id}`);
      set((state) => ({
        vendorsCache: { ...state.vendorsCache, [id]: res.data },
        currentVendors: res.data,
      }));
      updateVendorSelection(res.data);
    } catch {
      set({ currentVendors: [] });
    }
  },

  fetchWeeklyMatrix: async (params) => {
    if (!params.distributor_id || !params.vendor_id) return;

    set({ isLoading: true });
    try {
      const res = await api.get("/supervisor/sales/matrix", {
        params: { ...params, pageSize: 25 },
      });

      const mappedData = res.data.data.map((p: any) => ({
        ...p,
        name: p.name,
        price: p.unit_price,
      }));

      set({
        weeklyData: mappedData,
        weeklyDates: res.data.dates,
        weeklyStatuses: res.data.statuses || {},
        total: res.data.total,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, weeklyData: [] });
    }
  },

  upsertSaleItem: async (payload) => {
    const { product_id, date } = payload;
    const cellKey = `${product_id}-${date}`;
    set((s) => ({
      isSavingCell: { ...s.isSavingCell, [cellKey]: true },
      isErrorCell: { ...s.isErrorCell, [cellKey]: false },
    }));
    try {
      await api.post("/supervisor/sales/upsert", payload);
      toast.success("Quantité mise à jour", { duration: 2000 });
    } catch (err: any) {
      set((s) => ({ isErrorCell: { ...s.isErrorCell, [cellKey]: true } }));
      toast.error(
        `Erreur d'enregistrement : ${err.response?.data?.message || "Erreur inconnue"}`,
        { duration: 10000 },
      );
    } finally {
      set((s) => ({ isSavingCell: { ...s.isSavingCell, [cellKey]: false } }));
    }
  },

  updateSaleStatus: async (payload) => {
    try {
      await api.post("/supervisor/sales/status", payload);
      set((state) => ({
        weeklyStatuses: {
          ...state.weeklyStatuses,
          [payload.date]: payload.status,
        },
      }));
      toast.success(`Statut mis à jour`);
    } catch (error: any) {
      toast.error(
        `Erreur de changement de statut : ${error.response?.data?.message || "Erreur inconnue"}`,
        { duration: 10000 },
      );
    }
  },

  reset: () => set({ ...INITIAL_STATE, filters: INITIAL_FILTERS }),
}));
