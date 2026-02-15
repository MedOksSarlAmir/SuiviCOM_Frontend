"use client";
import React, { useEffect, useState } from "react";
import { useAdminDistributorStore } from "@/stores/admin/DistributorStore";
import { useGeographyStore } from "@/stores/admin/GeographyStore";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { DistributorTable } from "@/components/admin/distributors/DistributorTable";
import { DistributorModal } from "@/components/admin/distributors/DistributorModal";
import {
  Plus,
  Search,
  Filter,
  RotateCcw,
  Truck,
  MapPin,
  UserSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationControl } from "@/components/ui/pagination-control";

export default function AdminDistributorsPage() {
  const {
    total,
    page,
    limit,
    fetchDistributors,
    setPage,
    setLimit,
    setFilters,
    filters,
    supervisors,
    fetchSupervisors,
  } = useAdminDistributorStore();

  const { wilayas, fetchGeography } = useGeographyStore();

  const [modal, setModal] = useState<{ open: boolean; item: any | null }>({
    open: false,
    item: null,
  });

  useEffect(() => {
    fetchSupervisors();
    fetchGeography();
  }, [fetchSupervisors, fetchGeography]);

  useEffect(() => {
    fetchDistributors();
  }, [fetchDistributors, page, limit, filters]);

  const handleReset = () => {
    setFilters({
      search: "",
      status: "all",
      wilaya_id: "all",
      supervisor_id: "all",
    });
    setPage(1);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 overflow-hidden">
      <ModuleHeader
        title="Réseau de Distribution"
        subtitle="Gestion des partenaires et affectations logistiques."
        icon={Truck}
      />

      <main className="flex-1 flex flex-col p-8 gap-6 overflow-hidden">
        {/* --- FILTER TOOLBAR --- */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4 shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Rechercher un distributeur par nom..."
                className="pl-11 h-12 bg-zinc-50/50 border-zinc-200 rounded-xl font-medium"
                value={filters.search}
                onChange={(e) => {
                  setFilters({ search: e.target.value });
                  setPage(1);
                }}
              />
            </div>

            {/* Create */}
            <Button
              onClick={() => setModal({ open: true, item: null })}
              className="bg-amir-blue hover:bg-amir-blue-hover text-white h-12 font-black px-6 rounded-xl shadow-lg shadow-amir-blue/10 active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" />
              NOUVEAU PARTENAIRE
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-100">
            <span className="text-[10px] font-black uppercase text-zinc-400 mr-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtrage avancé
            </span>

            {/* Wilaya */}
            <Select
              value={filters.wilaya_id}
              onValueChange={(v) => {
                setFilters({ wilaya_id: v });
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] h-9 bg-white rounded-lg text-xs font-bold border-zinc-200">
                <MapPin className="w-3 h-3 mr-2 text-zinc-400" />
                <SelectValue placeholder="Wilaya" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">Toutes Wilayas</SelectItem>
                {wilayas.map((w) => (
                  <SelectItem key={w.id} value={w.id.toString()}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Supervisor */}
            <Select
              value={filters.supervisor_id}
              onValueChange={(v) => {
                setFilters({ supervisor_id: v });
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px] h-9 bg-white rounded-lg text-xs font-bold border-zinc-200">
                <UserSquare className="w-3 h-3 mr-2 text-zinc-400" />
                <SelectValue placeholder="Superviseur" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">Tous Superviseurs</SelectItem>
                {supervisors.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.last_name} {s.first_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={filters.status}
              onValueChange={(v) => {
                setFilters({ status: v });
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] h-9 bg-white rounded-lg text-xs font-bold border-zinc-200 px-3">
                <SelectValue placeholder="État" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">Tous états</SelectItem>
                <SelectItem value="active">🟢 Actifs</SelectItem>
                <SelectItem value="inactive">🔴 Inactifs</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              className="h-9 w-9 p-0 rounded-lg border border-zinc-100"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 text-zinc-400" />
            </Button>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white border border-zinc-200 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-sm">
          <div className="flex-1 overflow-y-auto">
            <DistributorTable
              onEdit={(item) => setModal({ open: true, item })}
            />
          </div>

          <div className="p-6 border-t bg-zinc-50/50">
            <PaginationControl
              total={total}
              page={page}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
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
