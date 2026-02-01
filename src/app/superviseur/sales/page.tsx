"use client";
import React, { useEffect } from "react";
import { useSalesStore } from "@/stores/SaleStore";
import { SalesFilters } from "@/components/superviseur/sales/SalesFilters";
import { SalesTable } from "@/components/superviseur/sales/SalesTable";
import { NewSaleModal } from "@/components/superviseur/sales/NewSaleModal";
import { PaginationControl } from "@/components/ui/pagination-control";
import { SalesHeader } from "@/components/superviseur/sales/SalesHeader";

export default function SalesPage() {
  const total = useSalesStore((s) => s.total);
  const page = useSalesStore((s) => s.page);
  const limit = useSalesStore((s) => s.limit);
  const setPage = useSalesStore((s) => s.setPage);
  const setLimit = useSalesStore((s) => s.setLimit);
  const fetchSales = useSalesStore((s) => s.fetchSales);
  const fetchDependencies = useSalesStore((s) => s.fetchDependencies);
  const resetSales = useSalesStore((s) => s.resetSales);

  useEffect(() => {
    fetchDependencies();
    fetchSales();
    return () => resetSales();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full relative">
      <SalesHeader />
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-7xl mx-auto pb-20">
          <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <SalesFilters />
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col">
              <div className="w-full flex justify-end p-4 border-b border-zinc-100">
                <NewSaleModal />
              </div>
              <SalesTable />

              {/* Pagination Footer */}
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
