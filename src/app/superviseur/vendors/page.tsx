"use client";
import React, { useEffect, useState } from "react";
import { useVendorStore } from "@/stores/VendorStore";
import { VendorHeader } from "@/components/superviseur/vendors/VendorHeader";
import { VendorFilters } from "@/components/superviseur/vendors/VendorFilters";
import { VendorTable } from "@/components/superviseur/vendors/VendorTable";
import { NewVendorModal } from "@/components/superviseur/vendors/NewVendorModal";
import { EditVendorModal } from "@/components/superviseur/vendors/EditVendorModal";

export default function VendorsPage() {
  const { fetchVendors } = useVendorStore();
  const [editItem, setEditItem] = useState<any>(null);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <VendorHeader />
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-zinc-50/30">
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
          <VendorFilters />
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col">
            <div className="p-4 border-b flex justify-end">
              <NewVendorModal />
            </div>
            <VendorTable onEdit={setEditItem} />
          </div>
        </div>
      </main>
      {editItem && (
        <EditVendorModal vendor={editItem} onClose={() => setEditItem(null)} />
      )}
    </div>
  );
}
