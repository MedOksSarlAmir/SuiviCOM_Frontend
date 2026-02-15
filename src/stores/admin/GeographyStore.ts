import { create } from "zustand";
import api from "@/services/api";
import { toast } from "sonner";

interface GeographyState {
  regions: any[];
  zones: any[];
  wilayas: any[];
  isLoading: boolean;
  fetchGeography: () => Promise<void>;

  addRegion: (name: string) => Promise<boolean>;
  deleteRegion: (id: number) => Promise<void>;

  addZone: (name: string, regionId: number) => Promise<boolean>;
  deleteZone: (id: number) => Promise<void>;

  addWilaya: (name: string, code: string, zoneId: number) => Promise<boolean>;
  deleteWilaya: (id: number) => Promise<void>;
}

export const useGeographyStore = create<GeographyState>((set, get) => ({
  regions: [],
  zones: [],
  wilayas: [],
  isLoading: false,

  fetchGeography: async () => {
    set({ isLoading: true });
    try {
      const [r, z, w] = await Promise.all([
        api.get("/admin/geography/regions"),
        api.get("/admin/geography/zones"),
        api.get("/admin/geography/wilayas"),
      ]);
      set({
        regions: r.data,
        zones: z.data,
        wilayas: w.data,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  addRegion: async (name) => {
    try {
      await api.post("/admin/geography/regions", { name });
      get().fetchGeography();
      toast.success("Région créée");
      return true;
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erreur");
      return false;
    }
  },

  deleteRegion: async (id) => {
    try {
      await api.delete(`/admin/geography/regions/${id}`);
      get().fetchGeography();
      toast.success("Région supprimée");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Action interdite");
    }
  },

  addZone: async (name, region_id) => {
    try {
      await api.post("/admin/geography/zones", { name, region_id });
      get().fetchGeography();
      toast.success("Zone créée");
      return true;
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erreur");
      return false;
    }
  },

  deleteZone: async (id) => {
    try {
      await api.delete(`/admin/geography/zones/${id}`);
      get().fetchGeography();
      toast.success("Zone supprimée");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Action interdite");
    }
  },

  addWilaya: async (name, code, zone_id) => {
    try {
      await api.post("/admin/geography/wilayas", { name, code, zone_id });
      get().fetchGeography();
      toast.success("Wilaya créée");
      return true;
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Erreur");
      return false;
    }
  },

  deleteWilaya: async (id) => {
    try {
      await api.delete(`/admin/geography/wilayas/${id}`);
      get().fetchGeography();
      toast.success("Wilaya supprimée");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Action interdite");
    }
  },
}));
