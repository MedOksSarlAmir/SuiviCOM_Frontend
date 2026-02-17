"use client";
import React, { useState, useEffect } from "react";
import { useObjectiveStore } from "@/stores/supervisor/ObjectiveStore";
import { useSalesStore } from "@/stores/supervisor/SaleStore";
import { FilterBar } from "@/components/shared/FilterBar";
import { ObjectivesMatrix } from "@/components/superviseur/objectives/ObjectivesMatrix";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Store,
  Calendar,
  Save,
  Loader2,
  Target,
  RotateCcw,
} from "lucide-react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ObjectivesPage() {
  const { distributors, fetchDependencies } = useSalesStore();
  const {
    objectiveType,
    setObjectiveType,
    fetchObjectiveMatrix,
    saveBulkObjectives,
    pendingChanges,
    isLoading,
    isAutoSave,
    toggleAutoSave,
    resetMatrix,
  } = useObjectiveStore();

  const [filters, setFilters] = useState({
    distributor_id: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // Clear store matrix data when leaving the page to avoid stale UI state
  useEffect(() => {
    fetchDependencies();
    return () => resetMatrix();
  }, [fetchDependencies, resetMatrix]);

  // Refetch when filters or the mode (Vendor vs Distributor) changes
  useEffect(() => {
    if (filters.distributor_id) {
      fetchObjectiveMatrix(filters);
    }
  }, [filters, objectiveType, fetchObjectiveMatrix]);

  const handleSave = async () => {
    const success = await saveBulkObjectives();
    if (success) fetchObjectiveMatrix(filters); // Force refresh UI after save
  };

  const pendingCount = Object.keys(pendingChanges).length;

  return (
    <div className="flex-1 flex flex-col bg-zinc-50/50 h-full">
      <ModuleHeader
        title="Paramétrage Objectifs"
        subtitle="Configuration des quotas mensuels."
        icon={Target}
      />

      <div className="bg-white border-b px-8 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg border">
            <button
              onClick={() => setObjectiveType("vendor")}
              className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${objectiveType === "vendor" ? "bg-white shadow-sm text-amir-blue" : "text-zinc-500"}`}
            >
              Ventes Vendeurs
            </button>
            <button
              onClick={() => setObjectiveType("distributor")}
              className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${objectiveType === "distributor" ? "bg-white shadow-sm text-amir-blue" : "text-zinc-500"}`}
            >
              Achats Dist.
            </button>
          </div>

          <div className="flex items-center space-x-2 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
            <Switch
              id="auto-save-obj"
              checked={isAutoSave}
              onCheckedChange={toggleAutoSave}
            />
            <Label
              htmlFor="auto-save-obj"
              className="text-[10px] font-bold uppercase cursor-pointer text-zinc-500"
            >
              Sauvegarde auto
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchObjectiveMatrix(filters)}
            className="h-9"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Actualiser
          </Button>
          {pendingCount > 0 && (
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-amir-blue h-9"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Enregistrer ({pendingCount})
            </Button>
          )}
        </div>
      </div>

      <main className="p-6 space-y-6 overflow-y-auto">
        <FilterBar
          fields={[
            {
              label: "Distributeur",
              icon: Store,
              render: (
                <Select
                  value={filters.distributor_id}
                  onValueChange={(v) =>
                    setFilters({ ...filters, distributor_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {distributors.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ),
            },
            {
              label: "Mois",
              icon: Calendar,
              render: (
                <Select
                  value={filters.month.toString()}
                  onValueChange={(v) =>
                    setFilters({ ...filters, month: parseInt(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(0, i).toLocaleString("fr", { month: "long" })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ),
            },
          ]}
        />

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <ObjectivesMatrix filters={filters} />
        </div>
      </main>
    </div>
  );
}
