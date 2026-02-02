"use client";
import React, { useState, useEffect } from "react";
import { useSalesStore } from "@/stores/SaleStore";
import { SalesHeader } from "@/components/superviseur/sales/SalesHeader";
import { SalesWeeklyGrid } from "@/components/superviseur/sales/SalesWeeklyGrid";
import { SalesMatrixFilters } from "@/components/superviseur/sales/SalesMatrixFilters";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Store, UserCheck } from "lucide-react";

const getSaturday = (selectedDate: Date) => {
  const d = new Date(selectedDate);
  const day = d.getDay();
  const diff = day === 6 ? 0 : -(day + 1);
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
};

export default function SalesPage() {
  const {
    distributors,
    currentVendors,
    fetchDependencies,
    fetchVendorsByDistributor,
    fetchWeeklyMatrix,
    total,
  } = useSalesStore();
  const [filters, setFilters] = useState({
    distributor_id: "",
    vendor_id: "",
    start_date: getSaturday(new Date()),
    category: "all",
    format: "all",
    product_type: "all",
    search: "",
    page: 1,
  });

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);
  useEffect(() => {
    if (filters.distributor_id && filters.vendor_id) {
      const delay = setTimeout(() => fetchWeeklyMatrix(filters), 300);
      return () => clearTimeout(delay);
    }
  }, [filters, fetchWeeklyMatrix]);

  const satDate = new Date(filters.start_date);
  const thuDate = new Date(satDate);
  thuDate.setDate(satDate.getDate() + 5);
  const weekLabel = `Du ${satDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} au ${thuDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full bg-zinc-50/50">
      <SalesHeader />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1500px] mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white border border-zinc-200 rounded-xl shadow-sm">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
                <Store className="w-3 h-3" /> Distributeur
              </Label>
              <Select
                value={filters.distributor_id}
                onValueChange={(id) => {
                  setFilters({ ...filters, distributor_id: id, vendor_id: "" });
                  fetchVendorsByDistributor(parseInt(id));
                }}
              >
                <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {distributors.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
                <UserCheck className="w-3 h-3" /> Vendeur
              </Label>
              <Select
                value={filters.vendor_id}
                onValueChange={(v) => setFilters({ ...filters, vendor_id: v })}
                disabled={!filters.distributor_id}
              >
                <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {currentVendors.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.code} - {v.nom} {v.prenom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Période
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={filters.start_date}
                  className="h-11 pl-10 bg-zinc-50/50 border-zinc-200"
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      start_date: getSaturday(new Date(e.target.value)),
                      page: 1,
                    })
                  }
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              </div>
              <p className="text-[10px] font-bold text-amir-blue mt-1.5 px-1 uppercase tracking-widest">
                {weekLabel}
              </p>
            </div>
          </div>
          {filters.vendor_id ? (
            <div className="flex flex-col shadow-lg rounded-xl overflow-hidden animate-in fade-in duration-500">
              <SalesMatrixFilters filters={filters} setFilters={setFilters} />
              <SalesWeeklyGrid filters={filters} />
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
              <Store className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">
                Veuillez sélectionner un distributeur et un vendeur pour
                commencer la saisie.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
