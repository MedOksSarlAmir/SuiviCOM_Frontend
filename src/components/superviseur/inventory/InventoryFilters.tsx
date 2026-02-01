"use client";
import React, { useState, useEffect } from "react";
import { useInventoryStore } from "@/stores/InventoryStore";
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
import { Search, Store, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InventoryFilters() {
  const { setFilters, filters } = useInventoryStore();
  const { distributors, fetchDependencies } = useSalesStore();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  useEffect(() => {
    if (!filters.distributor_id && distributors.length > 0) {
      setFilters({ distributor_id: distributors[0].id.toString() });
    }
  }, [distributors, filters.distributor_id, setFilters]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters({ search: searchTerm }); // ✅ no page here
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm, setFilters, filters.search]);

  return (
    <Card className="border-zinc-200 shadow-sm bg-white">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SEARCH */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1">
              Chercher par produit
            </Label>

            <div className="relative flex items-center gap-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />

              <Input
                placeholder="Nom ou code produit..."
                className="pl-9 bg-zinc-50 border-zinc-200 h-10 flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-red-500"
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({ search: "" }); // ✅ no page
                  }}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* DISTRIBUTOR */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1">
              Distributeur à consulter
            </Label>

            <Select
              value={filters.distributor_id}
              onValueChange={(val) => setFilters({ distributor_id: val })}
            >
              <SelectTrigger className="bg-zinc-50 border-zinc-200 h-10 text-sm pl-9 relative w-full">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amir-blue" />
                <SelectValue placeholder="Choisir un distributeur..." />
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
        </div>
      </CardContent>
    </Card>
  );
}
