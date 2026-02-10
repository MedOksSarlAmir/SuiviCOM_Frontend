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
    setFilters({ ...filters, distributor_id: distributors[0]?.id.toString() || "" });
    fetchInventory();
  }, [fetchInventory, fetchDependencies]);

  const handleGlobalRefresh = async () => {
    setRefreshing(true);
    await refreshGlobalInventory();
    setRefreshing(false);
    setShowRefresh(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50/30">
      <ModuleHeader
        title="Gestion des Stocks"
        subtitle="Niveaux de stock temps réel et historique des mouvements par distributeur."
        icon={Boxes}
      />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <FilterBar
                hasActiveFilters={filters.search !== ""}
                onReset={() => setFilters({ search: "" })}
                fields={[
                  {
                    label: "Distributeur",
                    icon: Store,
                    render: (
                      <Select
                        value={filters.distributor_id}
                        onValueChange={(val) =>
                          setFilters({ distributor_id: val })
                        }
                      >
                        <SelectTrigger className="h-9 bg-zinc-50">
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
                    label: "Recherche Produit",
                    icon: Search,
                    render: (
                      <Input
                        placeholder="Nom ou code..."
                        value={filters.search}
                        onChange={(e) => setFilters({ search: e.target.value })}
                        className="h-9 bg-zinc-50"
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

      {/* REFRESH WARNING MODAL */}
      <Dialog open={showRefresh} onOpenChange={setShowRefresh}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle /> Action Critique
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm">
              Cette opération va recalculer tous les stocks à partir de zéro en
              scannant l&apos;intégralité de l&apos;historique. Cela peut
              prendre quelques secondes. Continuer ?
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
