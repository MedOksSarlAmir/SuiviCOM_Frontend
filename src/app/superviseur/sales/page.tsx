"use client";
import React, { useEffect, useMemo } from "react";
import { useSalesStore } from "@/stores/SaleStore";
import { ModuleHeader } from "@/components/superviseur/shared/ModuleHeader";
import { FilterBar } from "@/components/superviseur/shared/FilterBar";
import { SalesWeeklyGrid } from "@/components/superviseur/sales/SalesWeeklyGrid";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Store,
  UserCheck,
  Calendar,
  Search,
  Filter,
  Layers,
} from "lucide-react";

const getSaturday = (selectedDate: Date) => {
  const d = new Date(selectedDate);
  const day = d.getDay();
  const diff = day === 6 ? 0 : -(day + 1);
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
};

export default function SalesPage() {
  const {
    distributors,
    currentVendors,
    categories,
    productTypes,
    filters,
    setFilters,
    fetchDependencies,
    fetchVendorsByDistributor,
    fetchWeeklyMatrix,
    total,
    isLoading,
  } = useSalesStore();

  // Load Initial Data (Distributors, Categories, etc.)
  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  // Fetch Matrix whenever filters change
  useEffect(() => {
    if (filters.distributor_id && filters.vendor_id) {
      const delay = setTimeout(() => fetchWeeklyMatrix(filters), 300);
      return () => clearTimeout(delay);
    }
  }, [filters, fetchWeeklyMatrix]);

  // Handle dynamic formats based on selected category
  const availableFormats = useMemo(() => {
    if (filters.category !== "all") {
      const selectedCat = categories.find(
        (c) => c.id.toString() === filters.category,
      );
      return selectedCat ? selectedCat.formats : [];
    }
    const allFormats = categories.flatMap((c) => c.formats);
    return Array.from(new Set(allFormats)).sort();
  }, [filters.category, categories]);

  // Date display logic
  const satDate = new Date(filters.start_date);
  const thuDate = new Date(satDate);
  thuDate.setDate(satDate.getDate() + 5);
  const weekLabel = `Du ${satDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} au ${thuDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`;

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50/50">
      <ModuleHeader
        title="Ventes Vendeurs"
        subtitle="Saisie et suivi des ventes hebdomadaires par force de vente."
        icon={ShoppingCart}
      />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* SELECTION BAR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white border border-zinc-200 rounded-xl shadow-sm">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
                <Store className="w-3 h-3" /> Distributeur
              </Label>
              <Select
                value={filters.distributor_id}
                onValueChange={(id) => {
                  setFilters({ distributor_id: id, vendor_id: "", page: 1 });
                  fetchVendorsByDistributor(parseInt(id));
                }}
              >
                <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {distributors.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
                <UserCheck className="w-3 h-3" /> Vendeur
              </Label>
              <Select
                value={filters.vendor_id}
                disabled={!filters.distributor_id}
                onValueChange={(v) => setFilters({ vendor_id: v, page: 1 })}
              >
                <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {currentVendors.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.code} - {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Période (Samedi)
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={filters.start_date}
                  className="h-11 pl-10"
                  onChange={(e) =>
                    setFilters({
                      start_date: getSaturday(new Date(e.target.value)),
                      page: 1,
                    })
                  }
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              </div>
              <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-widest">
                {weekLabel}
              </p>
            </div>
          </div>

          {/* MAIN GRID AND FILTERS */}
          {filters.vendor_id ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              <FilterBar
                hasActiveFilters={
                  filters.search !== "" ||
                  filters.category !== "all" ||
                  filters.format !== "all"
                }
                onReset={() =>
                  setFilters({
                    search: "",
                    category: "all",
                    format: "all",
                    product_type: "all",
                    page: 1,
                  })
                }
                fields={[
                  {
                    label: "Recherche Produit",
                    icon: Search,
                    render: (
                      <Input
                        placeholder="Nom ou code..."
                        value={filters.search}
                        onChange={(e) =>
                          setFilters({ search: e.target.value, page: 1 })
                        }
                        className="h-9 bg-zinc-50"
                      />
                    ),
                  },
                  {
                    label: "Type",
                    icon: Filter,
                    render: (
                      <Select
                        value={filters.product_type}
                        onValueChange={(v) =>
                          setFilters({ product_type: v, page: 1 })
                        }
                      >
                        <SelectTrigger className="h-9 bg-zinc-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          {productTypes.map((t) => (
                            <SelectItem key={t.id} value={t.id.toString()}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ),
                  },
                  {
                    label: "Famille",
                    icon: Layers,
                    render: (
                      <Select
                        value={filters.category}
                        onValueChange={(v) =>
                          setFilters({ category: v, format: "all", page: 1 })
                        }
                      >
                        <SelectTrigger className="h-9 bg-zinc-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ),
                  },
                  {
                    label: "Format",
                    render: (
                      <Select
                        value={filters.format}
                        onValueChange={(v) =>
                          setFilters({ format: v, page: 1 })
                        }
                      >
                        <SelectTrigger className="h-9 bg-zinc-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous</SelectItem>
                          {availableFormats.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ),
                  },
                ]}
              />

              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <SalesWeeklyGrid filters={filters} />
                <div className="p-4 border-t bg-zinc-50/50">
                  <PaginationControl
                    total={total}
                    limit={25}
                    page={filters.page}
                    onPageChange={(p) => setFilters({ page: p })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl bg-white text-zinc-400">
              <p>
                {isLoading
                  ? "Chargement..."
                  : "Veuillez sélectionner un distributeur et un vendeur."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
