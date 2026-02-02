"use client";
import React, { useState, useEffect } from "react";
import { useVisitStore } from "@/stores/VisitStore";
import { useSalesStore } from "@/stores/SaleStore";
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
import { Search, Calendar, Store, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VisitsFilters() {
  const { setFilters, filters } = useVisitStore();
  const { distributors, fetchDependencies } = useSalesStore();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  useEffect(() => {
    if (distributors.length === 0) fetchDependencies();
  }, [distributors.length, fetchDependencies]);

  useEffect(() => {
    const delay = setTimeout(() => setFilters({ search: searchTerm }), 500);
    return () => clearTimeout(delay);
  }, [searchTerm, setFilters]);

  const hasFilters =
    searchTerm ||
    filters.distributeur_id !== "all" ||
    filters.startDate ||
    filters.endDate;

  return (
    <Card className="border-zinc-200 shadow-sm bg-white">
      <CardContent className="p-4">
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] items-end">
          {/* Search */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase font-bold text-zinc-500">
              Vendeur
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Rechercher..."
                className={`pl-9 h-9 bg-zinc-50 border-zinc-200 text-sm w-full ${
                  hasFilters ? "pr-10" : ""
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Date range */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase font-bold text-zinc-500">
              Période (Du / Au)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <Input
                  type="date"
                  className="pl-8 h-9 bg-zinc-50 border-zinc-200 text-xs w-full min-w-0"
                  value={filters.startDate || ""}
                  onChange={(e) => setFilters({ startDate: e.target.value })}
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <Input
                  type="date"
                  className="pl-8 h-9 bg-zinc-50 border-zinc-200 text-xs w-full min-w-0"
                  value={filters.endDate || ""}
                  onChange={(e) => setFilters({ endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Distributor + X button */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase font-bold text-zinc-500">
              Distributeur
            </Label>
            <div className="flex gap-2">
              {/* Select grows */}
              <Select
                value={filters.distributeur_id ?? "all"}
                onValueChange={(v) => setFilters({ distributeur_id: v })}
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

              {/* Reset X button stays fixed */}
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-zinc-400 hover:text-red-500"
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
