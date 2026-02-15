import { create } from "zustand";
import api from "@/services/api";

interface GeographyState {
  regions: any[];
  zones: any[];
  wilayas: any[];
  isLoaded: boolean;
  fetchGeography: () => Promise<void>;
}

export const useGeographyStore = create<GeographyState>((set, get) => ({
  regions: [],
  zones: [],
  wilayas: [],
  isLoaded: false,

  fetchGeography: async () => {
    if (get().isLoaded) return;
    try {
      // Changed from /admin/geography/all to /shared/geography
      const res = await api.get("/shared/geography");
      set({
        regions: res.data.regions,
        zones: res.data.zones,
        wilayas: res.data.wilayas,
        isLoaded: true,
      });
    } catch (err) {
      console.error("Geo load error", err);
    }
  },
}));
