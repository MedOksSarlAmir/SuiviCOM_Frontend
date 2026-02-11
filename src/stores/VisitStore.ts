import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";

interface VisitMatrixItem {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  vendor_type: string;
  planned: number;
  actual: number;
  invoices: number;
  visit_id: number | null;
  active: boolean;
}

interface PendingVisit {
  vendor_id: number;
  field: string;
  value: number;
  date: string;
}

interface VisitState {
  visits: any[];
  total: number;
  isLoading: boolean;
  page: number;
  limit: number;
  filters: {
    startDate?: string;
    endDate?: string;
    search?: string;
    distributeur_id?: string;
  };
  matrixData: VisitMatrixItem[];

  // New States for Bulk/Auto Save
  isAutoSave: boolean;
  pendingChanges: Record<string, PendingVisit>;
  isSavingCell: Record<string, boolean>;
  isErrorCell: Record<string, boolean>;

  // Actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: Partial<VisitState["filters"]>) => void;
  fetchVisits: () => Promise<void>;
  fetchVisitMatrix: (params: any) => Promise<void>;

  toggleAutoSave: () => void;
  stageChange: (payload: PendingVisit, originalValue: number) => void;
  savePendingChanges: (filters: any) => Promise<void>;
  upsertVisitCell: (payload: PendingVisit) => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE = {
  visits: [],
  matrixData: [],
  isSavingCell: {},
  isErrorCell: {},
  total: 0,
  isLoading: false,
  page: 1,
  limit: 20,
  filters: { distributor_id: "all", search: "", startDate: "", endDate: "" },
  isAutoSave: false, // Default to Bulk Save
  pendingChanges: {},
};

export const useVisitStore = create<VisitState>((set, get) => ({
  ...INITIAL_STATE,

  toggleAutoSave: () => set((s) => ({ isAutoSave: !s.isAutoSave })),

  setPage: (page) => {
    set({ page });
    get().fetchVisits();
  },
  setLimit: (limit) => {
    set({ limit, page: 1 });
    get().fetchVisits();
  },
  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters }, page: 1 }));
    get().fetchVisits();
  },

  fetchVisits: async () => {
    set({ isLoading: true });
    const { page, limit, filters } = get();
    try {
      const res = await api.get("/supervisor/visits", {
        params: {
          page,
          pageSize: limit,
          search: filters.search,
          startDate: filters.startDate,
          endDate: filters.endDate,
          distributeur_id:
            filters.distributeur_id === "all"
              ? undefined
              : filters.distributeur_id,
        },
      });

      const mappedVisits = res.data.data.map((v: any) => ({
        ...v,
        visites_programmees: v.planned,
        visites_effectuees: v.actual,
        nb_factures: v.invoices,
      }));

      set({ visits: mappedVisits, total: res.data.total, isLoading: false });
    } catch {
      set({ isLoading: false, visits: [] });
    }
  },

  fetchVisitMatrix: async (params) => {
    set({ isLoading: true, pendingChanges: {} }); // Clear pending on refresh
    try {
      const res = await api.get("/supervisor/visits/matrix", {
        params: { ...params, pageSize: 25 },
      });
      set({
        matrixData: res.data.data,
        total: res.data.total,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, matrixData: [] });
    }
  },

  stageChange: (payload, originalValue) => {
    const key = `${payload.vendor_id}-${payload.field}`;

    // If user changed it back to original, remove from pending
    if (payload.value === originalValue) {
      set((state) => {
        const newPending = { ...state.pendingChanges };
        delete newPending[key];
        return { pendingChanges: newPending };
      });
      return;
    }

    set((state) => ({
      pendingChanges: { ...state.pendingChanges, [key]: payload },
    }));
  },

  savePendingChanges: async (filters) => {
    const { pendingChanges} = get();
    const entries = Object.values(pendingChanges);
    if (entries.length === 0) return;
    set({ isLoading: true });

    console.log(filters)
    try {
      // 🔹 ONE SINGLE REQUEST INSTEAD OF PROMISE.ALL
      await api.post("/supervisor/visits/bulk-upsert", entries);

      toast.success(`${entries.length} changements enregistrés avec succès`);

      set({ pendingChanges: {}, isLoading: false });
      get().fetchVisitMatrix(filters);
    } catch (err: any) {
      set({ isLoading: false });
      toast.error("Erreur lors de la sauvegarde groupée");
    }
  },

  upsertVisitCell: async (payload) => {
    const { vendor_id, field, value } = payload;
    const cellKey = `${vendor_id}-${field}`;
    const dataField = field === "prog" ? "planned" : field;

    set((state) => ({
      isSavingCell: { ...state.isSavingCell, [cellKey]: true },
      isErrorCell: { ...state.isErrorCell, [cellKey]: false },
      matrixData: state.matrixData.map((v) =>
        v.vendor_id === vendor_id ? { ...v, [dataField]: value } : v,
      ),
    }));

    try {
      await api.post("/supervisor/visits/upsert", payload);
      toast.success("Mis à jour", { duration: 1000 });
    } catch (err: any) {
      set((state) => ({
        isErrorCell: { ...state.isErrorCell, [cellKey]: true },
      }));
      toast.error("Erreur de sauvegarde");
    } finally {
      set((state) => ({
        isSavingCell: { ...state.isSavingCell, [cellKey]: false },
      }));
    }
  },

  reset: () => set(INITIAL_STATE),
}));
