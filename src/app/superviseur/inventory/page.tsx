"use client";
import React, { useEffect, useState } from "react";
import { useInventoryStore } from "@/stores/InventoryStore";
import { useSalesStore } from "@/stores/SaleStore";
import { ModuleHeader } from "@/components/superviseur/shared/ModuleHeader";
import { FilterBar } from "@/components/superviseur/shared/FilterBar";
import { InventoryTable } from "@/components/superviseur/inventory/InventoryTable";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Boxes,
  Search,
  Store,
  RefreshCcw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function InventoryPage() {
  const {
    fetchInventory,
    refreshGlobalInventory,
    total,
    page,
    limit,
    filters,
    setPage,
    setLimit,
    setFilters,
  } = useInventoryStore();
  const { distributors, fetchDependencies } = useSalesStore();
  const [showRefresh, setShowRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDependencies();
    // Initialize with first distributor if none selected
    if (!filters.distributor_id && distributors.length > 0) {
      setFilters({ ...filters, distributor_id: distributors[0].id.toString() });
    }
    fetchInventory();
  }, [fetchInventory, fetchDependencies]);

  const handleGlobalRefresh = async () => {
    setRefreshing(true);
    await refreshGlobalInventory();
    setRefreshing(false);
    setShowRefresh(false);
  };

  // Only consider search as an "active" filter that can be cleared
  const hasActiveFilters = filters.search !== "";

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50/30">
      <ModuleHeader
        title="Gestion des Stocks"
        subtitle="Niveaux de stock temps réel."
        icon={Boxes}
      />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <FilterBar
                hasActiveFilters={hasActiveFilters}
                onReset={() => setFilters({ ...filters, search: "" })} // Keep current distributor_id
                fields={[
                  {
                    label: "Distributeur",
                    icon: Store,
                    // Distributor is always required/selected, so we don't highlight it as "active" for reset purposes
                    render: (
                      <Select
                        value={filters.distributor_id}
                        onValueChange={(val) =>
                          setFilters({ ...filters, distributor_id: val })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            className="truncate"
                            placeholder="Choisir..."
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
                    label: "Recherche Produit",
                    icon: Search,
                    isActive: filters.search !== "",
                    render: (
                      <Input
                        placeholder="Nom ou code..."
                        value={filters.search}
                        onChange={(e) =>
                          setFilters({ ...filters, search: e.target.value })
                        }
                        className="w-full h-full"
                      />
                    ),
                  },
                ]}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-10 text-zinc-500 gap-2 border-dashed bg-white self-end mb-1"
              onClick={() => setShowRefresh(true)}
            >
              <RefreshCcw className="w-4 h-4" /> Recalculer Global
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <InventoryTable />
            <div className="p-4 border-t bg-zinc-50/50">
              <PaginationControl
                total={total}
                limit={limit}
                page={page}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showRefresh} onOpenChange={setShowRefresh}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle /> Action Critique
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm">
              Voulez-vous recalculer l&apos;intégralité des stocks ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowRefresh(false)}>
              Annuler
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleGlobalRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Oui, Recalculer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
