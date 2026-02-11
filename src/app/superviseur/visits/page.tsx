"use client";
import React, { useState, useEffect } from "react";
import { useVisitStore } from "@/stores/VisitStore";
import { useSalesStore } from "@/stores/SaleStore";
import { ModuleHeader } from "@/components/superviseur/shared/ModuleHeader";
import { FilterBar } from "@/components/superviseur/shared/FilterBar";
import { VisitsMatrix } from "@/components/superviseur/visits/VisitsMatrix";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardCheck,
  Store,
  Calendar,
  Users,
  Search,
  Save,
  Loader2,
} from "lucide-react";

export default function VisitsPage() {
  const {
    fetchVisitMatrix,
    total,
    pendingChanges,
    savePendingChanges,
    isAutoSave,
    toggleAutoSave,
    isLoading,
  } = useVisitStore();
  const { distributors, fetchDependencies } = useSalesStore();

  const [filters, setFilters] = useState({
    distributor_id: "",
    date: new Date().toISOString().split("T")[0],
    vendor_type: "all",
    search: "",
    page: 1,
  });

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    if (distributors.length > 0 && !filters.distributor_id) {
      setFilters((prev) => ({
        ...prev,
        distributor_id: distributors[0].id.toString(),
      }));
    }
  }, [distributors]);

  useEffect(() => {
    if (filters.distributor_id && filters.date) {
      const delay = setTimeout(() => fetchVisitMatrix(filters), 300);
      return () => clearTimeout(delay);
    }
  }, [filters, fetchVisitMatrix]);

  const pendingCount = Object.keys(pendingChanges).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full bg-zinc-50/50">
      <ModuleHeader
        title="Visites Terrain"
        subtitle="Performance vendeurs."
        icon={ClipboardCheck}
      />

      {/* Save Control Bar */}
      <div className="bg-white border-b px-8 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-save"
              checked={isAutoSave}
              onCheckedChange={toggleAutoSave}
            />
            <Label
              htmlFor="auto-save"
              className="text-xs font-medium cursor-pointer"
            >
              Sauvegarde automatique{" "}
              {isAutoSave ? (
                <span className="text-emerald-600">(Activée)</span>
              ) : (
                <span className="text-zinc-400">(Désactivée)</span>
              )}
            </Label>
          </div>
          {pendingCount > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold animate-pulse">
              {pendingCount} modification(s) en attente
            </span>
          )}
        </div>
        {!isAutoSave && (
          <Button
            disabled={pendingCount === 0 || isLoading}
            onClick={() => savePendingChanges(filters)}
            className="bg-amir-blue hover:bg-amir-blue/90 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Enregistrer les changements
          </Button>
        )}
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <FilterBar
            hasActiveFilters={
              filters.search !== "" || filters.vendor_type !== "all"
            }
            onReset={() =>
              setFilters((p) => ({
                ...p,
                search: "",
                vendor_type: "all",
                page: 1,
              }))
            }
            fields={[
              {
                label: "Distributeur",
                icon: Store,
                render: (
                  <Select
                    value={filters.distributor_id}
                    onValueChange={(val) =>
                      setFilters((p) => ({
                        ...p,
                        distributor_id: val,
                        page: 1,
                      }))
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
                label: "Date",
                icon: Calendar,
                render: (
                  <Input
                    type="date"
                    value={filters.date}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        date: e.target.value,
                        page: 1,
                      }))
                    }
                  />
                ),
              },
              {
                label: "Type",
                icon: Users,
                isActive: filters.vendor_type !== "all",
                render: (
                  <Select
                    value={filters.vendor_type}
                    onValueChange={(val) =>
                      setFilters((p) => ({ ...p, vendor_type: val, page: 1 }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="gros">Gros</SelectItem>
                      <SelectItem value="detail">Détail</SelectItem>
                      <SelectItem value="superette">Supérette</SelectItem>
                    </SelectContent>
                  </Select>
                ),
              },
              {
                label: "Recherche",
                icon: Search,
                isActive: filters.search !== "",
                render: (
                  <Input
                    placeholder="Code / Nom..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        search: e.target.value,
                        page: 1,
                      }))
                    }
                  />
                ),
              },
            ]}
          />

          {filters.distributor_id ? (
            <div className="flex flex-col border border-zinc-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <VisitsMatrix filters={filters} />
              <div className="bg-white border-t border-zinc-200 p-4">
                <PaginationControl
                  total={total}
                  limit={25}
                  page={filters.page}
                  onPageChange={(p) =>
                    setFilters((prev) => ({ ...prev, page: p }))
                  }
                />
              </div>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl bg-white text-zinc-400">
              <p>Sélectionnez un distributeur.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
