// src/components/superviseur/inventory/InventoryTable.tsx
"use client";
import React, { useState, memo, useEffect } from "react";
import { useInventoryStore } from "@/stores/InventoryStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Scale, History, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryDetailModal } from "./InventoryDetailModal";
import { AdjustmentModal } from "./AdjustmentModal";

const InventoryRow = memo(({ item, onViewHistory, onAdjust }: any) => {
  const updatePhysical = useInventoryStore((s) => s.updatePhysicalStock);
  const [localPhysical, setLocalPhysical] = useState(
    item.physical_qty.toString(),
  );

  // useEffect(() => {
  //   setLocalPhysical(item.physical_qty.toString());
  // }, [item.physical_qty]);

  const theoretical = item.theoretical_qty ?? 0;
  const physicalNum = parseInt(localPhysical) || 0;
  const gap = physicalNum - theoretical;

  const handleBlur = () => {
    if (physicalNum !== item.physical_qty) {
      updatePhysical(item.product_id, physicalNum);
    }
  };

  return (
    <TableRow
      className={cn(
        "group transition-colors",
        gap !== 0 ? "bg-amber-50/40" : "hover:bg-zinc-50/50",
      )}
    >
      <TableCell className="font-mono text-[10px] text-zinc-400 pl-6 w-[120px]">
        {item.product_code}
      </TableCell>
      <TableCell className="font-semibold text-zinc-800">
        {item.product_name}
      </TableCell>

      {/* Inventaire Logique (Theoretical) */}
      <TableCell className="text-center bg-zinc-50/50">
        <span
          className={cn(
            "text-sm font-bold",
            theoretical < 0 ? "text-red-600" : "text-zinc-600",
          )}
        >
          {theoretical}
        </span>
      </TableCell>

      {/* Inventaire Physique (Persistent Input) */}
      <TableCell className="w-[140px]">
        <Input
          type="number"
          className={cn(
            "h-8 text-center font-black border-zinc-300",
            gap !== 0 ? "border-amber-400 ring-1 ring-amber-100" : "",
          )}
          value={
            localPhysical === "0" && item.physical_qty === 0
              ? ""
              : localPhysical
          }
          placeholder="0"
          onFocus={(e) => e.target.select()}
          onChange={(e) => setLocalPhysical(e.target.value)}
          onBlur={handleBlur}
        />
      </TableCell>

      {/* Écart Display */}
      <TableCell className="text-center">
        {gap !== 0 ? (
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-xs",
              gap > 0
                ? "text-emerald-600 border-emerald-200"
                : "text-red-600 border-red-200",
            )}
          >
            {gap > 0 ? `+${gap}` : gap}
          </Badge>
        ) : (
          <span className="text-zinc-300 text-xs">—</span>
        )}
      </TableCell>

      <TableCell
        className="text-right pr-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-2">
          <Button
            variant={gap !== 0 ? "default" : "outline"}
            size="sm"
            onClick={() => onAdjust(item)}
            className={cn(
              "h-8 text-[11px]",
              gap !== 0
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "text-zinc-500",
            )}
          >
            <Scale className="w-3 h-3 mr-1.5" /> Ajuster
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewHistory(item)}
            className="h-8 text-[11px] text-zinc-400 hover:text-amir-blue"
          >
            <History className="w-3 h-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
InventoryRow.displayName = "InventoryRow";

export function InventoryTable() {
  const { items, isLoading, filters } = useInventoryStore();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustProduct, setAdjustProduct] = useState<any>(null);

  if (isLoading)
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-amir-blue" />
        <p className="text-xs text-zinc-400">
          Chargement de l&apos;inventaire...
        </p>
      </div>
    );

  return (
    <>
      <Table>
        <TableHeader className="bg-zinc-100/50 border-b">
          <TableRow>
            <TableHead className="pl-6">Code</TableHead>
            <TableHead>Désignation</TableHead>
            <TableHead className="text-center">Inv. Théorique</TableHead>
            <TableHead className="text-center">Inv. Physique (Réel)</TableHead>
            <TableHead className="text-center">Écart</TableHead>
            <TableHead className="text-right pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-60 text-center text-zinc-400 italic"
              >
                <PackageSearch className="mx-auto w-8 h-8 opacity-20 mb-2" />
                Aucun produit trouvé.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <InventoryRow
                key={item.product_id}
                item={item}
                onViewHistory={setSelectedProduct}
                onAdjust={setAdjustProduct}
              />
            ))
          )}
        </TableBody>
      </Table>

      {selectedProduct && (
        <InventoryDetailModal
          product={selectedProduct}
          distributorId={filters.distributor_id}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {adjustProduct && (
        <AdjustmentModal
          product={adjustProduct}
          distributorId={filters.distributor_id}
          open={!!adjustProduct}
          onClose={() => setAdjustProduct(null)}
        />
      )}
    </>
  );
}
