"use client";
import React, { useEffect, useState } from "react";
import { useVendorStore } from "@/stores/supervisor/VendorStore";
import { useSalesStore } from "@/stores/supervisor/SaleStore";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { VendorTable } from "@/components/superviseur/vendors/VendorTable";
import { VendorModal } from "@/components/superviseur/vendors/VendorModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search, Store, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VendorsPage() {
  const { vendors, fetchVendors, filters, setFilters } = useVendorStore();
  const { distributors, fetchDependencies } = useSalesStore();
  const [modalState, setModalState] = useState<{
    open: boolean;
    vendor: any | null;
  }>({ open: false, vendor: null });

  useEffect(() => {
    fetchVendors();
    fetchDependencies();
  }, [fetchVendors, fetchDependencies]);

  const hasActiveFilters =
    filters.search !== "" ||
    filters.distributor_id !== "all" ||
    filters.vendor_type !== "all";

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50/30">
      <ModuleHeader
        title="Gestion des Vendeurs"
        subtitle="Administration de votre force de vente terrain."
        icon={Users}
      />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <FilterBar
            hasActiveFilters={hasActiveFilters}
            onReset={() =>
              setFilters({
                search: "",
                distributor_id: "all",
                vendor_type: "all",
              })
            }
            fields={[
              {
                label: "Recherche",
                icon: Search,
                isActive: filters.search !== "",
                render: (
                  <Input
                    placeholder="Nom, Code..."
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                    className="h-9 bg-zinc-50 border-none"
                  />
                ),
              },
              {
                label: "Distributeur",
                icon: Store,
                isActive: filters.distributor_id !== "all",
                render: (
                  <Select
                    value={filters.distributor_id}
                    onValueChange={(v) => setFilters({ distributor_id: v })}
                  >
                    <SelectTrigger className="h-9 bg-zinc-50 border-none">
                      <SelectValue className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Tous les distributeurs
                      </SelectItem>
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
                label: "Type Vendeur",
                icon: Users,
                isActive: filters.vendor_type !== "all",
                render: (
                  <Select
                    value={filters.vendor_type}
                    onValueChange={(v) => setFilters({ vendor_type: v })}
                  >
                    <SelectTrigger className="h-9 bg-zinc-50 border-none">
                      <SelectValue />
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
            ]}
          />
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
            <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-xl">
              <h3 className="font-bold text-zinc-700">
                Liste des Vendeurs ({vendors.length})
              </h3>
              <Button
                onClick={() => setModalState({ open: true, vendor: null })}
                className="bg-amir-blue h-9"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Nouveau Vendeur
              </Button>
            </div>
            <VendorTable
              onEdit={(v) => setModalState({ open: true, vendor: v })}
            />
          </div>
        </div>
      </main>
      <VendorModal
        open={modalState.open}
        vendor={modalState.vendor}
        onClose={() => setModalState({ open: false, vendor: null })}
      />
    </div>
  );
}
