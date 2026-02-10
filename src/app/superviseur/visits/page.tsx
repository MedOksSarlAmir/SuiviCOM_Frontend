"use client";
import React, { useState, useEffect } from "react";
import { useVisitStore } from "@/stores/VisitStore";
import { useSalesStore } from "@/stores/SaleStore";
import { ModuleHeader } from "@/components/superviseur/shared/ModuleHeader";
import { FilterBar } from "@/components/superviseur/shared/FilterBar";
import { VisitsMatrix } from "@/components/superviseur/visits/VisitsMatrix";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardCheck, Store, Calendar, Users, Search } from "lucide-react";

export default function VisitsPage() {
  const { fetchVisitMatrix, total } = useVisitStore();
  const { distributors, fetchDependencies } = useSalesStore();

  const [filters, setFilters] = useState({
    distributor_id: distributors[0]?.id.toString() || "",
    date: new Date().toISOString().split("T")[0],
    vendor_type: "all",
    search: "",
    page: 1,
  });

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    if (filters.distributor_id && filters.date) {
      const delay = setTimeout(() => fetchVisitMatrix(filters), 300);
      return () => clearTimeout(delay);
    }
  }, [filters, fetchVisitMatrix]);

  const hasActiveFilters =
    filters.search !== "" || filters.vendor_type !== "all";

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full bg-zinc-50/50">
      <ModuleHeader
        title="Visites Terrain"
        subtitle="Suivi de la couverture et performance des vendeurs."
        icon={ClipboardCheck}
      />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <FilterBar
            hasActiveFilters={hasActiveFilters}
            onReset={() =>
              setFilters({ ...filters, search: "", vendor_type: "all" })
            }
            fields={[
              {
                label: "Distributeur",
                icon: Store,
                render: (
                  <Select
                    value={filters.distributor_id}
                    onValueChange={(id) =>
                      setFilters({ ...filters, distributor_id: id, page: 1 })
                    }
                  >
                    <SelectTrigger className="h-10 bg-zinc-50 border-zinc-200">
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
                label: "Date du Rapport",
                icon: Calendar,
                render: (
                  <div className="relative">
                    <Input
                      type="date"
                      value={filters.date}
                      className="h-10 pl-9 bg-zinc-50"
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          date: e.target.value,
                          page: 1,
                        })
                      }
                    />
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                  </div>
                ),
              },
              {
                label: "Type Vendeur",
                icon: Users,
                render: (
                  <Select
                    value={filters.vendor_type}
                    onValueChange={(v) =>
                      setFilters({ ...filters, vendor_type: v, page: 1 })
                    }
                  >
                    <SelectTrigger className="h-10 bg-zinc-50">
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
                render: (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                    <Input
                      placeholder="Code / Nom..."
                      className="h-10 pl-9 bg-zinc-50"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          search: e.target.value,
                          page: 1,
                        })
                      }
                    />
                  </div>
                ),
              },
            ]}
          />

          {filters.distributor_id ? (
            <div className="flex flex-col animate-in fade-in duration-500 shadow-sm border border-zinc-200 rounded-xl overflow-hidden">
              <VisitsMatrix filters={filters} />
              <div className="bg-white border-t border-zinc-200 p-4">
                <PaginationControl
                  total={total}
                  limit={25}
                  page={filters.page}
                  onPageChange={(p) => setFilters({ ...filters, page: p })}
                />
              </div>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl bg-white text-zinc-400">
              <ClipboardCheck className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-center px-6">
                Veuillez sélectionner un distributeur pour afficher le suivi des
                visites.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
