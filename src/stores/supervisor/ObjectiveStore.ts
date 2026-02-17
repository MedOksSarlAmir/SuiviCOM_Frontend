// src/stores/supervisor/ObjectiveStore.ts
import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";

interface ObjectiveState {
  matrixData: any[];
  matrixHeaders: any[];
  isLoading: boolean;
  pendingChanges: Record<string, any>;
  objectiveType: "vendor" | "distributor";

  isAutoSave: boolean;
  isSavingCell: Record<string, boolean>;
  isErrorCell: Record<string, boolean>;
  performanceData: any[];
  performanceDaysInfo: any;
  isPerfLoading: boolean;

  fetchPerformance: (params: any) => Promise<void>;
  toggleAutoSave: () => void;
  upsertSingleObjective: (payload: any) => Promise<void>;

  setObjectiveType: (type: "vendor" | "distributor") => void;
  fetchObjectiveMatrix: (params: any) => Promise<void>;
  stageObjectiveChange: (payload: any, originalValue: number) => void;
  saveBulkObjectives: () => Promise<boolean>;
  resetMatrix: () => void;
}

export const useObjectiveStore = create<ObjectiveState>((set, get) => ({
  matrixData: [],
  matrixHeaders: [],
  isLoading: false,
  pendingChanges: {},
  objectiveType: "vendor",

  isAutoSave: false,
  isSavingCell: {},
  isErrorCell: {},

  performanceData: [],
  performanceDaysInfo: null,
  isPerfLoading: false,

  fetchPerformance: async (params) => {
    set({ isPerfLoading: true });
    const { objectiveType } = get();
    try {
      const res = await api.get(
        `/supervisor/objectives/${objectiveType}/performance`,
        { params },
      );
      set({
        performanceData: res.data.performance,
        performanceDaysInfo: res.data.days_info,
        isPerfLoading: false,
      });
    } catch {
      set({ isPerfLoading: false, performanceData: [] });
    }
  },

  toggleAutoSave: () => set((s) => ({ isAutoSave: !s.isAutoSave })),

  setObjectiveType: (type) =>
    set({
      objectiveType: type,
      matrixData: [],
      pendingChanges: {},
      matrixHeaders: [],
    }),

  fetchObjectiveMatrix: async (params) => {
    set({
      isLoading: true,
      pendingChanges: {},
      isSavingCell: {},
      isErrorCell: {},
    }); // Clear states on refresh
    const { objectiveType } = get();
    try {
      const res = await api.get(
        `/supervisor/objectives/${objectiveType}/matrix`,
        { params },
      );
      set({
        matrixData: res.data.matrix,
        matrixHeaders:
          objectiveType === "vendor"
            ? res.data.vendors
            : [{ id: params.distributor_id, name: "Objectif Achat Dist." }],
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, matrixData: [], matrixHeaders: [] });
    }
  },

  stageObjectiveChange: (payload, originalValue) => {
    // Unique key handles both types
    const actorId = payload.vendor_id || payload.distributor_id;
    const key = `${actorId}-${payload.product_id}`;

    if (payload.target === originalValue) {
      set((s) => {
        const next = { ...s.pendingChanges };
        delete next[key];
        return { pendingChanges: next };
      });
      return;
    }
    set((s) => ({ pendingChanges: { ...s.pendingChanges, [key]: payload } }));
  },

  upsertSingleObjective: async (payload) => {
    const actorId = payload.vendor_id || payload.distributor_id;
    const cellKey = `${actorId}-${payload.product_id}`;
    const { objectiveType } = get();

    set((s) => ({
      isSavingCell: { ...s.isSavingCell, [cellKey]: true },
      isErrorCell: { ...s.isErrorCell, [cellKey]: false },
    }));

    try {
      // We send a list containing only one item to reuse the bulk BE logic
      await api.post(`/supervisor/objectives/${objectiveType}/upsert`, [
        payload,
      ]);
    } catch {
      set((s) => ({ isErrorCell: { ...s.isErrorCell, [cellKey]: true } }));
      toast.error("Erreur de sauvegarde individuelle");
    } finally {
      set((s) => ({ isSavingCell: { ...s.isSavingCell, [cellKey]: false } }));
    }
  },

  // Add this to your saveBulkObjectives inside ObjectiveStore.ts
  saveBulkObjectives: async () => {
    const changes = Object.values(get().pendingChanges);

    // Return false if there's nothing to save
    if (changes.length === 0) return false;

    const { objectiveType } = get();

    set({ isLoading: true });
    try {
      await api.post(`/supervisor/objectives/${objectiveType}/upsert`, changes);
      toast.success("Objectifs enregistrés");

      set({ pendingChanges: {}, isLoading: false });

      // Return true so the component knows it can refresh data
      return true;
    } catch (e: any) {
      set({ isLoading: false });
      toast.error(
        `Erreur : ${e.response?.data?.message || "Échec de sauvegarde"}`,
      );
      // Return false on error
      return false;
    }
  },

  resetMatrix: () =>
    set({
      matrixData: [],
      matrixHeaders: [],
      pendingChanges: {},
      isSavingCell: {},
      isErrorCell: {},
    }),
}));
