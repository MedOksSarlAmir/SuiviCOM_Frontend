"use client";
import React, { useEffect, useState } from "react";
import { useVisitStore } from "@/stores/VisitStore";
import { VisitsHeader } from "@/components/superviseur/visits/VisitsHeader";
import { VisitsFilters } from "@/components/superviseur/visits/VisitsFilters";
import { VisitsTable } from "@/components/superviseur/visits/VisitsTable";
import { NewVisitModal } from "@/components/superviseur/visits/NewVisitModal";
import { EditVisitModal } from "@/components/superviseur/visits/EditVisitModal";
import { PaginationControl } from "@/components/ui/pagination-control";

export default function VisitsPage() {
  const { fetchVisits, total, page, limit, setPage, setLimit } =
    useVisitStore();
  const [editItem, setEditItem] = useState<any>(null);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full relative">
      <VisitsHeader />
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-zinc-50/30">
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
          <VisitsFilters />
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col">
            <div className="p-4 border-b flex justify-end">
              <NewVisitModal />
            </div>
            <VisitsTable onEdit={setEditItem} />
            <div className="p-2 px-6 border-t bg-zinc-50/50 rounded-b-xl">
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
      {editItem && (
        <EditVisitModal visit={editItem} onClose={() => setEditItem(null)} />
      )}
    </div>
  );
}
