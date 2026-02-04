"use client";
import React, { useEffect } from "react";
import { usePurchaseStore } from "@/stores/PurchaseStore";
import { PurchasesHeader } from "@/components/superviseur/purchases/PurchasesHeader";
import { PurchasesFilters } from "@/components/superviseur/purchases/PurchasesFilters";
import { PurchasesTable } from "@/components/superviseur/purchases/PurchasesTable";
import { NewPurchaseModal } from "@/components/superviseur/purchases/NewPurchaseModal";
import { PaginationControl } from "@/components/ui/pagination-control";

export default function PurchasesPage() {
  // Selective selection from the store
  const total = usePurchaseStore((s) => s.total);
  const page = usePurchaseStore((s) => s.page);
  const limit = usePurchaseStore((s) => s.limit);
  const setPage = usePurchaseStore((s) => s.setPage);
  const setLimit = usePurchaseStore((s) => s.setLimit);
  const fetchPurchases = usePurchaseStore((s) => s.fetchPurchases);
  const fetchDependencies = usePurchaseStore((s) => s.fetchDependencies);
  const reset = usePurchaseStore((s) => s.reset);

  // Initialize data
  useEffect(() => {
    fetchDependencies();
    fetchPurchases();

    // Cleanup when leaving the page
    return () => reset();
  }, [fetchDependencies, fetchPurchases, reset]);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full relative">
      {/* 1. Header with User Context */}
      <PurchasesHeader />

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-zinc-50/30">
        <div className="max-w-7xl mx-auto pb-20">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* 2. Search & Filters Bar */}
            <PurchasesFilters />

            {/* 3. Main Content Card */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col">
              {/* Table Action Bar */}
              <div className="w-full flex justify-between items-center p-4 border-b border-zinc-100">
                <h3 className="font-semibold text-zinc-700 px-2">
                  Liste des achats
                </h3>
                <NewPurchaseModal />
              </div>

              {/* 4. The Data Table */}
              <PurchasesTable />

              {/* 5. Pagination Footer */}
              <div className="border-t border-zinc-100 p-2 px-6 bg-zinc-50/50 rounded-b-xl">
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
        </div>
      </main>
    </div>
  );
}
