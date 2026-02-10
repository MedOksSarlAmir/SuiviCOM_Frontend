"use client";
import React, { useEffect, useState } from "react";
import { useAdminProductStore } from "@/stores/AdminProductStore";
import { ModuleHeader } from "@/components/superviseur/shared/ModuleHeader";
import { FilterBar } from "@/components/superviseur/shared/FilterBar";
import { ProductTable } from "@/components/admin/products/ProductTable";
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
import { Package, PackagePlus, Search, Tag, Layers } from "lucide-react";
import { ProductModal } from "@/components/admin/products/ProductModal";

export default function AdminProductsPage() {
  const {
    products,
    total,
    page,
    limit,
    filters,
    fetchProducts,
    fetchMetadata,
    metadata,
    setPage,
    setFilters,
  } = useAdminProductStore();

  const [modal, setModal] = useState({ open: false, item: null });

  useEffect(() => {
    fetchMetadata();
    fetchProducts();
  }, [fetchProducts, fetchMetadata]);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50/30">
      <ModuleHeader
        title="Référentiel Produits"
        subtitle="Gestion du catalogue national et de la tarification."
        icon={Package}
      />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <FilterBar
            hasActiveFilters={
              filters.search !== "" ||
              filters.category_id !== "all" ||
              filters.type_id !== "all"
            }
            onReset={() =>
              setFilters({ search: "", category_id: "all", type_id: "all" })
            }
            fields={[
              {
                label: "Recherche",
                icon: Search,
                render: (
                  <Input
                    placeholder="Code, Désignation..."
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                    className="h-9 bg-zinc-50"
                  />
                ),
              },
              {
                label: "Famille",
                icon: Tag,
                render: (
                  <Select
                    value={filters.category_id}
                    onValueChange={(v) => setFilters({ category_id: v })}
                  >
                    <SelectTrigger className="h-9 bg-zinc-50">
                      <SelectValue placeholder="Toutes Familles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes Familles</SelectItem>
                      {metadata.categories.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ),
              },
              {
                label: "Type",
                icon: Layers,
                render: (
                  <Select
                    value={filters.type_id}
                    onValueChange={(v) => setFilters({ type_id: v })}
                  >
                    <SelectTrigger className="h-9 bg-zinc-50">
                      <SelectValue placeholder="Tous Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous Types</SelectItem>
                      {metadata.types.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ),
              },
            ]}
          />

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <h3 className="font-bold text-zinc-700">Catalogue ({total})</h3>
              <Button
                onClick={() => setModal({ open: true, item: null })}
                className="bg-amir-blue h-9"
              >
                <PackagePlus className="w-4 h-4 mr-2" /> Nouveau Produit
              </Button>
            </div>

            <ProductTable onEdit={(p) => setModal({ open: true, item: p })} />

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
        <ProductModal
          product={modal.item}
          onClose={() => setModal({ open: false, item: null })}
        />
      )}
    </div>
  );
}
