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
  designation: string;
  code: string;
  active: boolean;
  price: number;
  days: number[];
}

interface SalesState {
  weeklyData: WeeklyProduct[];
  weeklyDates: string[];
  weeklyStatuses: Record<string, string>;
  isSavingCell: Record<string, boolean>;
  total: number;
  isLoading: boolean;
  distributors: any[];
  currentVendors: any[];
  categories: CategoryWithFormats[];
  productTypes: any[];
  vendorsCache: Record<number, any[]>;
  isDependenciesLoaded: boolean;
  isErrorCell: Record<string, boolean>;
  fetchDependencies: () => Promise<void>;
  fetchVendorsByDistributor: (id: number) => Promise<void>;
  fetchWeeklyMatrix: (params: any) => Promise<void>;
  upsertSaleItem: (payload: any) => Promise<void>;
  updateSaleStatus: (payload: any) => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE = {
  weeklyData: [],
  weeklyDates: [],
  weeklyStatuses: {},
  isSavingCell: {},
  total: 0,
  isLoading: false,
  distributors: [],
  currentVendors: [],
  categories: [],
  productTypes: [],
  vendorsCache: {},
  isErrorCell: {},
  isDependenciesLoaded: false,
};

export const useSalesStore = create<SalesState>((set, get) => ({
  ...INITIAL_STATE,

  fetchDependencies: async () => {
    if (get().isDependenciesLoaded) return;
    try {
      const [dRes, cRes, tRes] = await Promise.all([
        api.get("/supervisor/distributors"),
        api.get("/supervisor/categories-with-formats"),
        api.get("/supervisor/types"),
      ]);
      set({
        distributors: dRes.data,
        categories: cRes.data,
        productTypes: tRes.data,
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
      const res = await api.get(`/supervisor/vendors/distributor/${id}`);
      set((state) => ({
        vendorsCache: { ...state.vendorsCache, [id]: res.data },
        currentVendors: res.data,
      }));
    } catch {
      set({ currentVendors: [] });
    }
  },

  fetchWeeklyMatrix: async (params) => {
    set({ isLoading: true });
    try {
      const res = await api.get("/sales/weekly-matrix", {
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

  upsertSaleItem: async (payload) => {
    const { product_id, date } = payload;
    const cellKey = `${product_id}-${date}`;
    set((s) => ({
      isSavingCell: { ...s.isSavingCell, [cellKey]: true },
      isErrorCell: { ...s.isErrorCell, [cellKey]: false },
    }));
    try {
      await api.post("/sales/upsert-item", payload);
      const { weeklyData, weeklyDates, weeklyStatuses } = get();
      const dayIdx = weeklyDates.indexOf(date);
      if (dayIdx !== -1) {
        const newData = weeklyData.map((p) => {
          if (p.product_id === product_id) {
            const newDays = [...p.days];
            newDays[dayIdx] = payload.quantity;
            return { ...p, days: newDays };
          }
          return p;
        });
        const newStatuses = { ...weeklyStatuses };
        if (!newStatuses[date]) newStatuses[date] = "complete";
        set({ weeklyData: newData, weeklyStatuses: newStatuses });
      }
      toast.success("Quantité mise à jour", { duration: 2000 });
    } catch (err: any) {
      set((s) => ({ isErrorCell: { ...s.isErrorCell, [cellKey]: true } }));
      toast.error("Erreur d'enregistrement");
    } finally {
      set((s) => ({ isSavingCell: { ...s.isSavingCell, [cellKey]: false } }));
    }
  },

  updateSaleStatus: async (payload) => {
    const { date, status } = payload;
    try {
      await api.post("/sales/update-status", payload);
      set((state) => ({
        weeklyStatuses: { ...state.weeklyStatuses, [date]: status },
      }));
      toast.success(`Vente marquée comme ${status}`);
    } catch {
      toast.error("Erreur de changement de statut");
    }
  },

  reset: () => set(INITIAL_STATE),
}));
