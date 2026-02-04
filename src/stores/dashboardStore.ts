import { create } from "zustand";
import api from "@/services/api";

interface DashboardState {
  stats: any | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE = {
  stats: null,
  isLoading: false,
  error: null,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  ...INITIAL_STATE,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/dashboard/stats");
      set({ stats: res.data.data, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: "Erreur lors du chargement des statistiques",
      });
    }
  },

  reset: () => set(INITIAL_STATE),
}));
