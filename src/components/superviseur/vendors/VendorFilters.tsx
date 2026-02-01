"use client";
import React, { useState, useEffect } from "react";
import { useVendorStore } from "@/stores/VendorStore";
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
import { Search, Store, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VendorFilters() {
  const { setFilters, filters } = useVendorStore();
  const { distributors, fetchDependencies } = useSalesStore();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  useEffect(() => {
    if (distributors.length === 0) fetchDependencies();
  }, [distributors.length, fetchDependencies]);

  useEffect(() => {
    const delay = setTimeout(() => setFilters({ search: searchTerm }), 400);
    return () => clearTimeout(delay);
  }, [searchTerm, setFilters]);

  const hasFilters =
    searchTerm ||
    filters.distributor_id !== "all" ||
    filters.vendor_type !== "all";

  return (
    <Card className="border-zinc-200 shadow-sm bg-white">
      <CardContent className="p-4">
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] items-end">

          {/* Search */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1">
              Recherche vendeur
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Nom, Code..."
                className="pl-9 bg-zinc-50 border-zinc-200 h-9 text-sm w-full"
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
              value={filters.distributor_id ?? "all"}
              onValueChange={(val) => setFilters({ distributor_id: val })}
            >
              <SelectTrigger className="bg-zinc-50 border-zinc-200 h-9 text-sm pl-9 relative w-full">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les distributeurs</SelectItem>
                {distributors.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vendor Type + Reset */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1">
              Type de vendeur
            </Label>

            <div className="flex gap-2">
              <Select
                value={filters.vendor_type ?? "all"}
                onValueChange={(val) => setFilters({ vendor_type: val })}
              >
                <SelectTrigger className="bg-zinc-50 border-zinc-200 h-9 text-sm pl-9 relative w-full">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="gros">Gros</SelectItem>
                  <SelectItem value="detail">Détail</SelectItem>
                  <SelectItem value="superette">Supérette</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-zinc-400 hover:text-red-500"
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({
                      search: "",
                      distributor_id: "all",
                      vendor_type: "all",
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
