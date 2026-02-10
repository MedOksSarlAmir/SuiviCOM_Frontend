"use client";
import React, { useState, memo } from "react";
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
import { Loader2, Scale, History, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryDetailModal } from "./InventoryDetailModal";
import { AdjustmentModal } from "./AdjustmentModal";

const InventoryRow = memo(({ item, onViewHistory, onAdjust }: any) => (
  <TableRow
    className={cn(
      "group cursor-pointer hover:bg-zinc-50/50",
      (item.stock ?? item.quantity) < 0 && "bg-red-50/20",
    )}
    onClick={() => onViewHistory(item)}
  >
    <TableCell className="font-mono text-[10px] text-zinc-400 pl-6 w-[120px]">
      {item.code || item.product_code}
    </TableCell>
    <TableCell className="font-semibold text-zinc-800">
      {item.name || item.product_name}
    </TableCell>
    <TableCell className="text-center">
      <div className="flex items-center justify-center gap-3">
        <span
          className={cn(
            "text-lg font-black tabular-nums",
            (item.stock ?? item.quantity) < 0
              ? "text-red-600"
              : "text-zinc-900",
          )}
        >
          {item.stock ?? item.quantity}
        </span>
        {(item.stock ?? item.quantity) < 0 && (
          <Badge
            variant="destructive"
            className="h-5 text-[9px] font-bold tracking-tighter"
          >
            STOCK NÉGATIF
          </Badge>
        )}
      </div>
    </TableCell>
    <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAdjust(item)}
          className="h-8 text-[11px] border-amber-200 text-amber-700 hover:bg-amber-50"
        >
          <Scale className="w-3 h-3 mr-1.5" /> Ajuster
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewHistory(item)}
          className="h-8 text-[11px] text-zinc-500"
        >
          <History className="w-3 h-3 mr-1.5" /> Historique
        </Button>
      </div>
    </TableCell>
  </TableRow>
));
InventoryRow.displayName = "InventoryRow";

export function InventoryTable() {
  const { items, isLoading, filters } = useInventoryStore();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustProduct, setAdjustProduct] = useState<any>(null);

  if (isLoading)
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-amir-blue" />
        <p className="text-xs text-zinc-400">Chargement...</p>
      </div>
    );

  return (
    <>
      <Table>
        <TableHeader className="bg-zinc-50/50 border-b">
          <TableRow>
            <TableHead className="pl-6">Code</TableHead>
            <TableHead>Désignation</TableHead>
            <TableHead className="text-center">Stock Digital</TableHead>
            <TableHead className="text-right pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
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
