"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Tag, Layers } from "lucide-react";
import { useAdminProductStore } from "@/stores/admin/ProductStore";

export function ProductFilters() {
  const { filters, setFilters, metadata } = useAdminProductStore();

  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Code ou désignation..."
          className="pl-9"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
        />
      </div>

      <Select
        value={filters.category_id}
        onValueChange={(v) => setFilters({ category_id: v })}
      >
        <SelectTrigger className="pl-9 relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <SelectValue placeholder="Toutes les familles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les familles</SelectItem>
          {metadata.categories.map((c) => (
            <SelectItem key={c.id} value={c.id.toString()}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.type_id}
        onValueChange={(v) => setFilters({ type_id: v })}
      >
        <SelectTrigger className="pl-9 relative">
          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <SelectValue placeholder="Tous les types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les types</SelectItem>
          {metadata.types.map((t) => (
            <SelectItem key={t.id} value={t.id.toString()}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
