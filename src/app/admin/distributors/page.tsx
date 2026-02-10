"use client";
import React, { useEffect, useState } from "react";
import { useAdminDistributorStore } from "@/stores/AdminDistributorStore";
import { ModuleHeader } from "@/components/superviseur/shared/ModuleHeader";
import { FilterBar } from "@/components/superviseur/shared/FilterBar";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Plus, Search } from "lucide-react";
import { DistributorTable } from "@/components/admin/distributors/DistributorTable";
import { DistributorModal } from "@/components/admin/distributors/DistributorModal";

export default function AdminDistributorsPage() {
  const {
    total,
    page,
    limit,
    filters,
    fetchDistributors,
    setPage,
    setFilters,
  } = useAdminDistributorStore();
  const [modal, setModal] = useState<{ open: boolean; item: any | null }>({
    open: false,
    item: null,
  });

  useEffect(() => {
    fetchDistributors();
  }, [fetchDistributors]);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50/30">
      <ModuleHeader
        title="Gestion Distributeurs"
        subtitle="Administration des partenaires logistiques et rattachement géographique."
        icon={Store}
      />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
          <FilterBar
            hasActiveFilters={filters.search !== ""}
            onReset={() => setFilters({ search: "" })}
            fields={[
              {
                label: "Recherche",
                icon: Search,
                render: (
                  <Input
                    placeholder="Filtrer par nom..."
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                    className="h-9 bg-zinc-50"
                  />
                ),
              },
            ]}
          />

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <h3 className="font-bold text-zinc-700">Liste des Partenaires</h3>
              <Button
                onClick={() => setModal({ open: true, item: null })}
                className="bg-amir-blue h-9"
              >
                <Plus className="w-4 h-4 mr-2" /> Nouveau Distributeur
              </Button>
            </div>

            <DistributorTable
              onEdit={(item) => setModal({ open: true, item })}
            />

            <div className="p-4 border-t bg-zinc-50/50">
              <PaginationControl
                total={total}
                limit={limit}
                page={page}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      </main>

      {modal.open && (
        <DistributorModal
          open={modal.open}
          distributor={modal.item}
          onClose={() => setModal({ open: false, item: null })}
        />
      )}
    </div>
  );
}
