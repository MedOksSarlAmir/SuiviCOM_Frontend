"use client";
import React, { useState, useEffect } from "react";
import { useSalesStore } from "@/stores/SaleStore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Ensure you have this shadcn component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Calendar, Store, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SalesFilters() {
  const { setFilters, filters, distributors, fetchDependencies } =
    useSalesStore();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  useEffect(() => {
    if (distributors.length === 0) fetchDependencies();
  }, [distributors.length, fetchDependencies]);

  useEffect(() => {
    const delay = setTimeout(() => setFilters({ search: searchTerm }), 500);
    return () => clearTimeout(delay);
  }, [searchTerm, setFilters]);

  return (
    <Card className="border-zinc-200 shadow-sm bg-white">
      <CardContent className="p-4">
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] items-end">
          {/* Search */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1">
              Recherche libre
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="N°, Distributeur, Vendeur ..."
                className="pl-9 bg-zinc-50 border-zinc-200 h-9 text-sm w-full focus-visible:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Distributor */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1">
              Distributeur
            </Label>
            <Select
              value={filters.distributeur_id ?? "all"}
              onValueChange={(val) => setFilters({ distributeur_id: val })}
            >
              <SelectTrigger className="bg-zinc-50 border-zinc-200 h-9 text-sm pl-9 relative w-full">
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

          {/* Date Range Group */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1">
              Période (Du / Au)
            </Label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <Input
                  type="date"
                  className="pl-8 bg-zinc-50 border-zinc-200 h-9 text-xs w-full min-w-0"
                  value={filters.startDate || ""}
                  onChange={(e) => setFilters({ startDate: e.target.value })}
                />
              </div>

              <div className="relative">
                <Calendar className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <Input
                  type="date"
                  className="pl-8 bg-zinc-50 border-zinc-200 h-9 text-xs w-full min-w-0"
                  value={filters.endDate || ""}
                  onChange={(e) => setFilters({ endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1">
              État de la vente
            </Label>
            <div className="flex gap-2">
              <Select
                value={filters.status ?? "all"}
                onValueChange={(val) => setFilters({ status: val })}
              >
                <SelectTrigger className="bg-zinc-50 border-zinc-200 h-9 text-sm pl-9 relative w-full">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <SelectValue placeholder="Tout statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les états</SelectItem>
                  <SelectItem value="en_cours">🟠 En cours</SelectItem>
                  <SelectItem value="complete">🟢 Validée</SelectItem>
                  <SelectItem value="annulee">🔴 Annulée</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset Button - Very useful when many filters are active */}
              {(filters.search ||
                filters.distributeur_id !== "all" ||
                filters.startDate ||
                filters.endDate ||
                filters.status != "all"
              ) && (
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
