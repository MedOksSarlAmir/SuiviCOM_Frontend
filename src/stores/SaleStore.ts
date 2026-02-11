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

interface PendingSale {
  vendor_id: number;
  distributor_id: number;
  product_id: number;
  date: string;
  quantity: number;
}

interface SalesState {
  weeklyData: WeeklyProduct[];
  weeklyDates: string[];
  weeklyStatuses: Record<string, string>;
  total: number;
  isLoading: boolean;
  distributors: any[];
  currentVendors: any[];
  categories: CategoryWithFormats[];
  productTypes: any[];
  vendorsCache: Record<number, any[]>;
  isDependenciesLoaded: boolean;
  filters: SalesFilters;

  // Bulk Save States
  isAutoSave: boolean;
  pendingChanges: Record<string, PendingSale>;
  isSavingCell: Record<string, boolean>;
  isErrorCell: Record<string, boolean>;

  // Actions
  setFilters: (filters: Partial<SalesFilters>) => void;
  fetchDependencies: () => Promise<void>;
  fetchVendorsByDistributor: (id: number) => Promise<void>;
  fetchWeeklyMatrix: (params: SalesFilters) => Promise<void>;

  toggleAutoSave: () => void;
  stageSaleChange: (payload: PendingSale, originalValue: number) => void;
  saveAllSales: () => Promise<void>;
  upsertSaleItem: (payload: PendingSale) => Promise<void>;
  updateSaleStatus: (payload: any) => Promise<void>;
  reset: () => void;
}

const INITIAL_FILTERS: SalesFilters = {
  distributor_id: "",
  vendor_id: "",
  start_date: new Date().toISOString().split("T")[0], // placeholder
  category: "all",
  format: "all",
  product_type: "all",
  search: "",
  page: 1,
};

export const useSalesStore = create<SalesState>((set, get) => ({
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
  filters: INITIAL_FILTERS,
  isAutoSave: false,
  pendingChanges: {},

  toggleAutoSave: () => set((s) => ({ isAutoSave: !s.isAutoSave })),

  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  fetchDependencies: async () => {
    if (get().isDependenciesLoaded) return;
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
    } catch (err) {
      console.error(err);
    }
  },

  fetchVendorsByDistributor: async (id) => {
    if (get().vendorsCache[id]) {
      set({ currentVendors: get().vendorsCache[id] });
      return;
    }
    try {
      const res = await api.get(`/shared/vendors/distributor/${id}`);
      set((s) => ({
        vendorsCache: { ...s.vendorsCache, [id]: res.data },
        currentVendors: res.data,
      }));
    } catch {
      set({ currentVendors: [] });
    }
  },

  fetchWeeklyMatrix: async (params) => {
    set({ isLoading: true, pendingChanges: {} });
    try {
      const res = await api.get("/supervisor/sales/matrix", {
        params: { ...params, pageSize: 25 },
      });
      set({
        weeklyData: res.data.data,
        weeklyDates: res.data.dates,
        weeklyStatuses: res.data.statuses || {},
        total: res.data.total,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, weeklyData: [] });
    }
  },

  stageSaleChange: (payload, originalValue) => {
    const key = `${payload.product_id}-${payload.date}`;
    if (payload.quantity === originalValue) {
      set((s) => {
        const next = { ...s.pendingChanges };
        delete next[key];
        return { pendingChanges: next };
      });
      return;
    }
    set((s) => ({ pendingChanges: { ...s.pendingChanges, [key]: payload } }));
  },

  saveAllSales: async () => {
    const { pendingChanges, filters } = get();
    const items = Object.values(pendingChanges);
    if (items.length === 0) return;

    set({ isLoading: true });
    try {
      // 🔹 ONE SINGLE REQUEST
      await api.post("/supervisor/sales/bulk-upsert", items);

      toast.success("Toutes les modifications ont été enregistrées");

      set({ pendingChanges: {}, isLoading: false });
      // Refresh to update totals in UI
      get().fetchWeeklyMatrix(filters);
    } catch (err: any) {
      set({ isLoading: false });
      toast.error("Échec de la sauvegarde groupée");
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
      toast.success("Mis à jour", { duration: 1000 });
    } catch {
      set((s) => ({ isErrorCell: { ...s.isErrorCell, [cellKey]: true } }));
      toast.error("Erreur");
    } finally {
      set((s) => ({ isSavingCell: { ...s.isSavingCell, [cellKey]: false } }));
    }
  },

  updateSaleStatus: async (payload) => {
    try {
      await api.post("/supervisor/sales/status", payload);
      set((s) => ({
        weeklyStatuses: { ...s.weeklyStatuses, [payload.date]: payload.status },
      }));
      toast.success(`Statut mis à jour`);
    } catch (e: any) {
      toast.error("Erreur statut");
    }
  },

  reset: () =>
    set({
      weeklyData: [],
      weeklyDates: [],
      weeklyStatuses: {},
      isSavingCell: {},
      isErrorCell: {},
      pendingChanges: {},
      filters: INITIAL_FILTERS,
    }),
}));
