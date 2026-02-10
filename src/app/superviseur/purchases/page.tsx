"use client";
import React, { useEffect, useState } from "react";
import { usePurchaseStore } from "@/stores/PurchaseStore";
import { ModuleHeader } from "@/components/superviseur/shared/ModuleHeader";
import { FilterBar } from "@/components/superviseur/shared/FilterBar";
import { PurchasesTable } from "@/components/superviseur/purchases/PurchasesTable";
import { PurchaseModal } from "@/components/superviseur/purchases/PurchaseModal";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  Search,
  Store,
  Calendar,
  Filter,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PurchasesPage() {
  const {
    purchases,
    total,
    page,
    limit,
    filters,
    setPage,
    setLimit,
    setFilters,
    fetchPurchases,
    fetchDependencies,
  } = usePurchaseStore();
  const [modal, setModal] = useState<{ open: boolean; item: any | null }>({
    open: false,
    item: null,
  });

  useEffect(() => {
    fetchDependencies();
    fetchPurchases();
  }, [fetchPurchases, fetchDependencies]);

  const hasActiveFilters =
    filters.search !== "" ||
    filters.distributeur_id !== "all" ||
    filters.status !== "all" ||
    !!filters.startDate;

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50/30">
      <ModuleHeader
        title="Achats Distributeurs"
        subtitle="Historique et gestion des approvisionnements usine."
        icon={ShoppingBag}
      />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <FilterBar
            hasActiveFilters={hasActiveFilters}
            onReset={() =>
              setFilters({
                search: "",
                distributeur_id: "all",
                status: "all",
                startDate: "",
                endDate: "",
              })
            }
            fields={[
              {
                label: "Recherche",
                icon: Search,
                render: (
                  <Input
                    placeholder="N° ou Nom..."
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                    className="h-9 bg-zinc-50"
                  />
                ),
              },
              {
                label: "Partenaire",
                icon: Store,
                render: (
                  <Select
                    value={filters.distributeur_id}
                    onValueChange={(v) => setFilters({ distributeur_id: v })}
                  >
                    <SelectTrigger className="h-9 bg-zinc-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {usePurchaseStore.getState().distributors.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ),
              },
              {
                label: "Statut",
                icon: Filter,
                render: (
                  <Select
                    value={filters.status}
                    onValueChange={(v) => setFilters({ status: v })}
                  >
                    <SelectTrigger className="h-9 bg-zinc-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="complete">Validée</SelectItem>
                    </SelectContent>
                  </Select>
                ),
              },
              {
                label: "Période",
                icon: Calendar,
                render: (
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={filters.startDate || ""}
                      onChange={(e) =>
                        setFilters({ startDate: e.target.value })
                      }
                      className="h-9 bg-zinc-50 text-xs"
                    />
                    <Input
                      type="date"
                      value={filters.endDate || ""}
                      onChange={(e) => setFilters({ endDate: e.target.value })}
                      className="h-9 bg-zinc-50 text-xs"
                    />
                  </div>
                ),
              },
            ]}
          />

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-zinc-700">Flux d&apos;achats</h3>
              <Button
                onClick={() => setModal({ open: true, item: null })}
                className="bg-amir-blue h-9"
              >
                <Plus className="w-4 h-4 mr-2" /> Nouvel Achat
              </Button>
            </div>

            <PurchasesTable onEdit={(item) => setModal({ open: true, item })} />

            <div className="p-4 border-t bg-zinc-50/50 rounded-b-xl">
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

      <PurchaseModal
        open={modal.open}
        purchase={modal.item}
        onClose={() => setModal({ open: false, item: null })}
      />
    </div>
  );
}
