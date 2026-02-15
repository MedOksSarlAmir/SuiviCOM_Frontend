"use client";
import React, { useEffect, useMemo } from "react";
import { useSalesStore } from "@/stores/supervisor/SaleStore";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { SalesWeeklyGrid } from "@/components/superviseur/sales/SalesWeeklyGrid";
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
  ShoppingCart,
  Store,
  UserCheck,
  Calendar,
  Search,
  Filter,
  Layers,
  Save,
  Loader2,
  AlertCircle,
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
    // Bulk save states
    isAutoSave,
    toggleAutoSave,
    pendingChanges,
    saveAllSales,
  } = useSalesStore();

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    if (filters.distributor_id && filters.vendor_id) {
      const delay = setTimeout(() => fetchWeeklyMatrix(filters), 300);
      return () => clearTimeout(delay);
    }
  }, [filters, fetchWeeklyMatrix]);

  const availableFormats = useMemo(() => {
    if (filters.category !== "all") {
      const selectedCat = categories.find(
        (c) => c.id.toString() === filters.category,
      );
      return selectedCat ? selectedCat.formats : [];
    }
    return Array.from(new Set(categories.flatMap((c) => c.formats))).sort();
  }, [filters.category, categories]);

  const satDate = new Date(filters.start_date);
  const thuDate = new Date(satDate);
  thuDate.setDate(satDate.getDate() + 5);
  const weekLabel = `Du ${satDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} au ${thuDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`;

  const pendingCount = Object.keys(pendingChanges).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50/50">
      <ModuleHeader
        title="Ventes Vendeurs"
        subtitle="Saisie et suivi des ventes hebdomadaires."
        icon={ShoppingCart}
      />

      {/* SAVE CONTROLS BAR */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center space-x-3 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
            <Switch
              id="auto-save-sales"
              checked={isAutoSave}
              onCheckedChange={toggleAutoSave}
            />
            <Label
              htmlFor="auto-save-sales"
              className="text-[11px] font-bold uppercase tracking-wider cursor-pointer"
            >
              Sauvegarde auto :{" "}
              {isAutoSave ? (
                <span className="text-emerald-600">Active</span>
              ) : (
                <span className="text-zinc-400">Désactivée</span>
              )}
            </Label>
          </div>

          {pendingCount > 0 && (
            <div className="flex items-center gap-2 text-amber-600 animate-in fade-in slide-in-from-left-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold">
                {pendingCount} modification(s) non enregistrée(s)
              </span>
            </div>
          )}
        </div>

        {!isAutoSave && (
          <Button
            size="sm"
            disabled={pendingCount === 0 || isLoading}
            onClick={saveAllSales}
            className="bg-amir-blue hover:bg-amir-blue/90 text-white shadow-md transition-all active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Enregistrer tout
          </Button>
        )}
      </div>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* PRIMARY SELECTION GROUP */}
          <FilterBar
            hasActiveFilters={false}
            fields={[
              {
                label: "Distributeur",
                icon: Store,
                render: (
                  <Select
                    value={filters.distributor_id}
                    onValueChange={(id) => {
                      setFilters({
                        ...filters,
                        distributor_id: id,
                        vendor_id: "",
                        page: 1,
                      });
                      fetchVendorsByDistributor(parseInt(id));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        className="truncate"
                        placeholder="Sélectionner..."
                      />
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
                label: "Vendeur",
                icon: UserCheck,
                render: (
                  <Select
                    value={filters.vendor_id}
                    disabled={!filters.distributor_id}
                    onValueChange={(v) =>
                      setFilters({ ...filters, vendor_id: v, page: 1 })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        className="truncate"
                        placeholder="Sélectionner..."
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {currentVendors.map((v) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.code} - {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ),
              },
              {
                label: `Période (${weekLabel})`,
                icon: Calendar,
                render: (
                  <div className="relative w-full h-full flex items-center">
                    <Input
                      type="date"
                      value={filters.start_date}
                      className="pl-9"
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          start_date: getSaturday(new Date(e.target.value)),
                          page: 1,
                        })
                      }
                    />
                    <Calendar className="absolute left-3 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                  </div>
                ),
              },
            ]}
          />

          {/* SECONDARY FILTER GROUP */}
          {filters.vendor_id ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              <FilterBar
                hasActiveFilters={
                  filters.search !== "" ||
                  filters.category !== "all" ||
                  filters.format !== "all" ||
                  filters.product_type !== "all"
                }
                onReset={() =>
                  setFilters({
                    ...filters,
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
                    isActive: filters.search !== "",
                    render: (
                      <Input
                        placeholder="Nom ou code..."
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
                  {
                    label: "Type",
                    icon: Filter,
                    isActive: filters.product_type !== "all",
                    render: (
                      <Select
                        value={filters.product_type}
                        onValueChange={(v) =>
                          setFilters({ ...filters, product_type: v, page: 1 })
                        }
                      >
                        <SelectTrigger>
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
                    isActive: filters.category !== "all",
                    render: (
                      <Select
                        value={filters.category}
                        onValueChange={(v) =>
                          setFilters({
                            ...filters,
                            category: v,
                            format: "all",
                            page: 1,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue className="truncate" />
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
                    isActive: filters.format !== "all",
                    render: (
                      <Select
                        value={filters.format}
                        onValueChange={(v) =>
                          setFilters({ ...filters, format: v, page: 1 })
                        }
                      >
                        <SelectTrigger>
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
                    onPageChange={(p) => setFilters({ ...filters, page: p })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl bg-white text-zinc-400">
              <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-center px-6">
                {isLoading
                  ? "Chargement..."
                  : "Veuillez sélectionner un distributeur et un vendeur pour afficher la matrice des ventes."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
