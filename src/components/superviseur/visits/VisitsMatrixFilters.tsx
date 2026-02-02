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
  const { distributors, fetchVendorsByDistributor } = useSalesStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-white border border-zinc-200 rounded-xl shadow-sm">
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
          <Store className="w-3 h-3" /> Distributeur
        </Label>
        <Select
          value={filters.distributor_id}
          onValueChange={(id) => {
            setFilters({ ...filters, distributor_id: id, page: 1 });
          }}
        >
          <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200">
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

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
          <Calendar className="w-3 h-3" /> Date du Rapport
        </Label>
        <div className="relative">
          <Input
            type="date"
            value={filters.date}
            className="h-11 pl-10 bg-zinc-50/50 border-zinc-200"
            onChange={(e) =>
              setFilters({ ...filters, date: e.target.value, page: 1 })
            }
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
          <Users className="w-3 h-3" /> Type Vendeur
        </Label>
        <Select
          value={filters.vendor_type}
          onValueChange={(v) =>
            setFilters({ ...filters, vendor_type: v, page: 1 })
          }
        >
          <SelectTrigger className="h-11 bg-zinc-50/50 border-zinc-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="gros">Gros</SelectItem>
            <SelectItem value="detail">Détail</SelectItem>
            <SelectItem value="superette">Supérette</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2">
          <Search className="w-3 h-3" /> Recherche
        </Label>
        <Input
          placeholder="Nom du vendeur..."
          className="h-11 bg-zinc-50/50 border-zinc-200"
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value, page: 1 })
          }
        />
      </div>
    </div>
  );
}
