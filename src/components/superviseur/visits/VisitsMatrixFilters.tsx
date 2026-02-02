"use client";
import React from "react";
import { useSalesStore } from "@/stores/SaleStore";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Store, Calendar, Users } from "lucide-react";
import { Label } from "@/components/ui/label";

export function VisitsMatrixFilters({ filters, setFilters }: any) {
  const { distributors } = useSalesStore();

  return (
    <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-4">
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] items-end">
        {/* Distributor */}
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1 flex items-center gap-1">
            <Store className="w-3 h-3" /> Distributeur
          </Label>
          <Select
            value={filters.distributor_id}
            onValueChange={(id) =>
              setFilters({ ...filters, distributor_id: id, page: 1 })
            }
          >
            <SelectTrigger className="h-10 bg-zinc-50 border-zinc-200 text-sm relative">
              <SelectValue placeholder="Choisir..." />
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

        {/* Report Date */}
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Date du Rapport
          </Label>
          <div className="relative">
            <Input
              type="date"
              value={filters.date}
              className="h-10 pl-9 bg-zinc-50 border-zinc-200 text-sm"
              onChange={(e) =>
                setFilters({ ...filters, date: e.target.value, page: 1 })
              }
            />
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {/* Vendor Type */}
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1 flex items-center gap-1">
            <Users className="w-3 h-3" /> Type Vendeur
          </Label>
          <Select
            value={filters.vendor_type}
            onValueChange={(v) =>
              setFilters({ ...filters, vendor_type: v, page: 1 })
            }
          >
            <SelectTrigger className="h-10 bg-zinc-50 border-zinc-200 text-sm">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="gros">Gros</SelectItem>
              <SelectItem value="detail">Détail</SelectItem>
              <SelectItem value="superette">Supérette</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1 flex items-center gap-1">
            <Search className="w-3 h-3" /> Recherche
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <Input
              placeholder="Code / Nom Vendeur..."
              className="h-10 pl-9 bg-zinc-50 border-zinc-200 text-sm"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value, page: 1 })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
