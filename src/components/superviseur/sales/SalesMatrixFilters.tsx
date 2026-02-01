"use client";
import React, { useMemo } from "react";
import { useSalesStore } from "@/stores/SaleStore";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export function SalesMatrixFilters({ filters, setFilters }: any) {
  const { categories, productTypes } = useSalesStore();

  // Determine which formats to show
  const availableFormats = useMemo(() => {
    if (filters.category !== "all") {
      // 1. If a specific category is selected, show only its formats
      const selectedCat = categories.find(
        (c) => c.id.toString() === filters.category,
      );
      return selectedCat ? selectedCat.formats : [];
    } else {
      // 2. If NO category is selected, show ALL distinct formats from all categories
      const allFormats = categories.flatMap((c) => c.formats);
      return Array.from(new Set(allFormats)).sort(); // Remove duplicates and sort
    }
  }, [filters.category, categories]);

  return (
    <div className="flex flex-col md:flex-row gap-3 items-center bg-zinc-50/80 p-4 rounded-t-xl border-x border-t border-zinc-200">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Rechercher par nom ou code..."
          className="pl-9 h-10 bg-white border-zinc-200 focus-visible:ring-amir-blue"
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value, page: 1 })
          }
        />
      </div>

      <div className="flex gap-2 shrink-0">
        {/* PRODUCT TYPE */}
        <Select
          value={filters.product_type}
          onValueChange={(v) =>
            setFilters({ ...filters, product_type: v, page: 1 })
          }
        >
          <SelectTrigger className="h-10 w-[140px] bg-white border-zinc-200">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous Types</SelectItem>
            {productTypes.map((t) => (
              <SelectItem key={t.id} value={t.id.toString()}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* CATEGORY (Famille) */}
        <Select
          value={filters.category}
          onValueChange={(v) =>
            setFilters({ ...filters, category: v, format: "all", page: 1 })
          }
        >
          <SelectTrigger className="h-10 w-[140px] bg-white border-zinc-200">
            <SelectValue placeholder="Famille" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes Familles</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* FORMAT */}
        <Select
          value={filters.format}
          onValueChange={(v) => setFilters({ ...filters, format: v, page: 1 })}
        >
          <SelectTrigger className="h-10 w-[140px] bg-white border-zinc-200">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous Formats</SelectItem>
            {availableFormats.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
