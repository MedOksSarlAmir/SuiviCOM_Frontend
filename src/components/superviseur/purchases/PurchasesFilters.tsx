"use client";
import React, { useState, useEffect } from "react";
import { usePurchaseStore } from "@/stores/PurchaseStore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Calendar, Store, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PurchasesFilters() {
  const { setFilters, filters, distributors, fetchDependencies } =
    usePurchaseStore();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    const delay = setTimeout(() => setFilters({ search: searchTerm }), 400);
    return () => clearTimeout(delay);
  }, [searchTerm, setFilters]);

  return (
    <Card className="border-zinc-200 shadow-sm bg-white">
      <CardContent className="p-4">
        {/* We use the exact same grid setup as Sales to maintain alignment */}
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] items-end">
          {/* 1. Search */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1">
              Recherche
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="N° Commande, Distributeur..."
                className="pl-9 bg-zinc-50 border-zinc-200 h-9 text-sm focus-visible:ring-amir-blue"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* 2. Distributor Select */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1">
              Distributeur
            </Label>
            <Select
              value={filters.distributeur_id ?? "all"}
              onValueChange={(val) => setFilters({ distributeur_id: val })}
            >
              <SelectTrigger className="bg-zinc-50 border-zinc-200 h-9 text-sm pl-9 relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les partenaires</SelectItem>
                {distributors.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Date Range Group (This occupies exactly 1 grid slot, matching Sales) */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1">
              Période
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                <Input
                  type="date"
                  className="pl-8 bg-zinc-50 border-zinc-200 h-9 text-xs"
                  value={filters.startDate || ""}
                  onChange={(e) => setFilters({ startDate: e.target.value })}
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                <Input
                  type="date"
                  className="pl-8 bg-zinc-50 border-zinc-200 h-9 text-xs"
                  value={filters.endDate || ""}
                  onChange={(e) => setFilters({ endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* 4. Status */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1">
              Statut
            </Label>
            <div className="flex gap-2">
              <Select
                value={filters.status ?? "all"}
                onValueChange={(val) => setFilters({ status: val })}
              >
                <SelectTrigger className="bg-zinc-50 border-zinc-200 h-9 text-sm pl-9 relative w-full">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les états</SelectItem>
                  <SelectItem value="en_cours">🟠 En cours</SelectItem>
                  <SelectItem value="complete">🟢 Validée</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset button only appears if filters are active */}
              {(searchTerm ||
                filters.distributeur_id !== "all" ||
                filters.startDate ||
                filters.endDate ||
                filters.status !== "all") && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-zinc-400 hover:text-red-500"
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({
                      search: "",
                      distributeur_id: "all",
                      startDate: "",
                      endDate: "",
                      status: "all",
                    });
                  }}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
