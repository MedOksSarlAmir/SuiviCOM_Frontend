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
    if (!filters.distributor_id && distributors.length > 0) {
      setFilters((f) => ({
        ...f,
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

  const hasActiveFilters =
    filters.search !== "" || filters.vendor_type !== "all";

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full bg-zinc-50/50">
      <ModuleHeader
        title="Visites Terrain"
        subtitle="Performance vendeurs."
        icon={ClipboardCheck}
      />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <FilterBar
            hasActiveFilters={hasActiveFilters}
            onReset={() =>
              setFilters({
                ...filters, // Keep distributor_id and date
                search: "",
                vendor_type: "all",
                page: 1,
              })
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
                    <SelectTrigger>
                      <SelectValue className="truncate" />
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
                      setFilters({ ...filters, date: e.target.value, page: 1 })
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
                    onValueChange={(v) =>
                      setFilters({ ...filters, vendor_type: v, page: 1 })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
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
                      setFilters({
                        ...filters,
                        search: e.target.value,
                        page: 1,
                      })
                    }
                  />
                ),
              },
            ]}
          />
          {filters.distributor_id ? (
            <div className="flex flex-col border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
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
              <p>Sélectionnez un distributeur.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
