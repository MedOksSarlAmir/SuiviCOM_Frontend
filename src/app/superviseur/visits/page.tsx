"use client";
import React, { useState, useEffect } from "react";
import { useVisitStore } from "@/stores/VisitStore";
import { useSalesStore } from "@/stores/SaleStore";
import { VisitsHeader } from "@/components/superviseur/visits/VisitsHeader";
import { VisitsMatrixFilters } from "@/components/superviseur/visits/VisitsMatrixFilters";
import { VisitsMatrix } from "@/components/superviseur/visits/VisitsMatrix";
import { PaginationControl } from "@/components/ui/pagination-control";
import { ClipboardCheck } from "lucide-react";

export default function VisitsPage() {
  const { fetchVisitMatrix, total } = useVisitStore();
  const { fetchDependencies } = useSalesStore();

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
    if (filters.distributor_id && filters.date) {
      const delay = setTimeout(() => fetchVisitMatrix(filters), 300);
      return () => clearTimeout(delay);
    }
  }, [filters, fetchVisitMatrix]);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full bg-zinc-50/50">
      <VisitsHeader />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <VisitsMatrixFilters filters={filters} setFilters={setFilters} />

          {filters.distributor_id ? (
            <div className="flex flex-col animate-in fade-in duration-500">
              <VisitsMatrix filters={filters} />
              <div className="bg-white border-x border-b border-zinc-200 p-4 rounded-b-xl">
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
              <ClipboardCheck className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">
                Veuillez sélectionner un distributeur pour afficher la grille
                des visites.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
