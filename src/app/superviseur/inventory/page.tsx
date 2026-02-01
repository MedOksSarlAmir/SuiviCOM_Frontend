"use client";
import React, { useEffect, useState } from "react";
import { useInventoryStore } from "@/stores/InventoryStore";
import { InventoryHeader } from "@/components/superviseur/inventory/InventoryHeader";
import { InventoryFilters } from "@/components/superviseur/inventory/InventoryFilters";
import { InventoryTable } from "@/components/superviseur/inventory/InventoryTable";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertCircle, Loader2 } from "lucide-react";
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
    fetchInventory, // 👈 YOU MISSED THIS
    refreshGlobalInventory, // 👈 AND THIS
    total,
    page,
    limit,
    setPage,
    setLimit,
  } = useInventoryStore();

  const [showRefresh, setShowRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleGlobalRefresh = async () => {
    setRefreshing(true);
    await refreshGlobalInventory();
    setRefreshing(false);
    setShowRefresh(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full relative">
      <InventoryHeader />

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-zinc-50/30">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-zinc-500 gap-2 border-dashed"
              onClick={() => setShowRefresh(true)}
            >
              <RefreshCcw className="w-4 h-4" /> Recalculer Global
            </Button>
          </div>

          <InventoryFilters />

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col">
            <InventoryTable />

            <div className="border-t p-2 px-6 bg-zinc-50/50">
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
            <DialogDescription className="pt-2">
              Cette opération va recalculer tous les stocks à partir de zéro en
              scannant l&apos;intégralité de l&apos;historique des ventes,
              achats et décalages. Cela peut prendre quelques secondes.
              Continuer ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowRefresh(false)}>
              Annuler
            </Button>
            <Button
              className="bg-red-600"
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
