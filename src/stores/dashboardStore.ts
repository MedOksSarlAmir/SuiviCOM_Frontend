import { create } from "zustand";
import api from "@/services/api";

export const useDashboardStore = create<any>((set) => ({
  stats: null,
  isLoading: false,
  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/dashboard/stats");
      // Flask returns { "data": { ... } }
      set({ stats: res.data.data, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: "Error fetching stats" });
    }
  },
  reset: () => set({ stats: null, isLoading: false }),
}));
