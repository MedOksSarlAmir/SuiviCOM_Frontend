"use client";
import React, { useEffect, useState } from "react";
import { useGeographyStore } from "@/stores/admin/GeographyStore";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { GeoCreateForm } from "@/components/admin/geography/GeoCreateForm";
import { GeoTable } from "@/components/admin/geography/GeoTable";
import { Map, Globe, MapPinned, Landmark, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GeographyPage() {
  const { fetchGeography } = useGeographyStore();
  const [activeTab, setActiveTab] = useState<"regions" | "zones" | "wilayas">(
    "regions",
  );

  useEffect(() => {
    fetchGeography();
  }, [fetchGeography]);

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 overflow-hidden">
      <ModuleHeader
        title="Découpage Géographique"
        subtitle="Structure territoriale : Régions > Zones > Wilayas."
        icon={Map}
      />

      <div className="flex-1 flex flex-col overflow-hidden p-8 gap-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-200/50 w-fit rounded-xl border border-zinc-200">
          <TabBtn
            active={activeTab === "regions"}
            onClick={() => setActiveTab("regions")}
            icon={Globe}
            label="Régions"
          />
          <TabBtn
            active={activeTab === "zones"}
            onClick={() => setActiveTab("zones")}
            icon={MapPinned}
            label="Zones"
          />
          <TabBtn
            active={activeTab === "wilayas"}
            onClick={() => setActiveTab("wilayas")}
            icon={Landmark}
            label="Wilayas"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
          {/* Form Side */}
          <div className="lg:col-span-4 space-y-4">
            <GeoCreateForm activeTab={activeTab} />

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed font-medium">
                La hiérarchie est stricte. Vous ne pouvez pas supprimer une
                région contenant des zones, ni une zone contenant des wilayas.
              </p>
            </div>
          </div>

          {/* List Side */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
            <GeoTable activeTab={activeTab} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
        active
          ? "bg-white text-amir-blue shadow-sm"
          : "text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-800",
      )}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}
