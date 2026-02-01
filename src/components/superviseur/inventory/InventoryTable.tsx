"use client";
import React, { useState, memo, useCallback } from "react";
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
import { Button } from "@/components/ui/button"; // Utilisation du composant Button standard
import {
  Loader2,
  AlertTriangle,
  Scale,
  History,
  PackageSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryDetailModal } from "./InventoryDetailModal";
import { AdjustmentModal } from "./AdjustmentModal";

const InventoryRow = memo(({ item, onViewHistory, onAdjust }: any) => {
  const isNegative = item.stock < 0;

  return (
    <TableRow
      className={cn(
        "group cursor-pointer hover:bg-indigo-50/30 transition-colors group",
        isNegative && "bg-red-50/20",
      )}
      onClick={() => onViewHistory(item)}
    >
      <TableCell className="font-mono text-xs text-zinc-500 pl-6">
        {item.code}
      </TableCell>
      <TableCell className="font-medium text-zinc-800">
        {item.designation}
      </TableCell>

      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-3">
          <span
            className={cn(
              "text-lg font-bold tabular-nums",
              isNegative ? "text-red-600" : "text-zinc-900",
            )}
          >
            {item.stock}
          </span>
          {isNegative && (
            <Badge variant="destructive" className="h-5 text-[10px] font-bold">
              <AlertTriangle className="w-3 h-3 mr-1" /> STOCK NÉGATIF
            </Badge>
          )}
        </div>
      </TableCell>

      <TableCell
        className="text-right pr-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-2">
          {/* BOUTON AJUSTER (TEXTUEL) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAdjust(item)}
            className="h-8 text-xs border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 gap-1.5"
          >
            <Scale className="w-3.5 h-3.5" />
            Ajuster
          </Button>

          {/* BOUTON HISTORIQUE (TEXTUEL) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewHistory(item)}
            className="h-8 text-xs text-zinc-500 hover:text-amir-blue hover:bg-amir-blue/5 gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            Historique
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
InventoryRow.displayName = "InventoryRow";

export function InventoryTable() {
  const items = useInventoryStore((state) => state.items);
  const isLoading = useInventoryStore((state) => state.isLoading);
  const distributorId = useInventoryStore(
    (state) => state.filters.distributor_id,
  );

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustProduct, setAdjustProduct] = useState<any>(null);

  if (isLoading)
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-amir-blue h-8 w-8" />
        <p className="text-zinc-400 text-sm">Chargement des stocks...</p>
      </div>
    );

  return (
    <>
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/80">
            <TableRow>
              <TableHead className="w-[150px] pl-6">Code</TableHead>
              <TableHead>Désignation Produit</TableHead>
              <TableHead className="text-center">Stock Digital</TableHead>
              <TableHead className="w-[220px] pr-6 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-60 text-center text-zinc-400 italic"
                >
                  <div className="flex flex-col items-center gap-2">
                    <PackageSearch className="w-8 h-8 opacity-20" />
                    <p>Aucun produit trouvé dans cet inventaire.</p>
                  </div>
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
      </div>

      {selectedProduct && (
        <InventoryDetailModal
          product={selectedProduct}
          distributorId={distributorId}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {adjustProduct && (
        <AdjustmentModal
          product={adjustProduct}
          distributorId={distributorId}
          open={!!adjustProduct}
          onClose={() => setAdjustProduct(null)}
        />
      )}
    </>
  );
}
