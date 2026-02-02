"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSalesStore } from "@/stores/SaleStore";
import { Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CellProps {
  productId: number;
  date: string;
  initialValue: number;
  rowIdx: number;
  colIdx: number;
  onKeyDown: (e: React.KeyboardEvent, r: number, c: number) => void;
  inputRef: (el: HTMLInputElement | null) => void;
  context: { vendor_id: string; distributor_id: string };
}

export const SalesGridCell = React.memo(
  ({
    productId,
    date,
    initialValue,
    rowIdx,
    colIdx,
    onKeyDown,
    inputRef,
    context,
  }: CellProps) => {
    const [val, setVal] = useState(() => initialValue.toString());

    const upsert = useSalesStore((s) => s.upsertSaleItem);

    const cellKey = `${productId}-${date}`;
    const isSaving = useSalesStore((s) => s.isSavingCell[cellKey]);
    const isError = useSalesStore((s) => s.isErrorCell[cellKey]);

    const triggerSave = useCallback(
      async (forcedValue?: string) => {
        const numericVal = parseInt(forcedValue ?? val) || 0;

        // Only save if value changed OR if we are retrying an error
        if (numericVal === initialValue && !isError) return;

        await upsert({
          vendor_id: Number(context.vendor_id),
          distributor_id: Number(context.distributor_id),
          product_id: productId,
          date,
          quantity: numericVal,
        });
      },
      [val, initialValue, isError, upsert, context, productId, date],
    );

    return (
      <div
        className={cn(
          "relative h-full w-full transition-colors",
          isError && "bg-red-50 ring-1 ring-inset ring-red-500 z-10",
        )}
      >
        <input
          ref={inputRef}
          type="number"
          value={val}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => triggerSave()}
          onKeyDown={(e) => onKeyDown(e, rowIdx, colIdx)}
          className={cn(
            "w-full h-10 text-center bg-transparent outline-none transition-all font-mono text-sm border-none focus-visible:ring-0",
            val === "0" ? "text-zinc-300" : "text-zinc-900 font-bold",
            isSaving && "opacity-50",
            isError && "text-red-600",
          )}
        />

        {/* Saving indicator */}
        {isSaving && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="w-3 h-3 animate-spin text-amir-blue" />
          </div>
        )}

        {/* Error Retry UI */}
        {isError && !isSaving && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-red-50 pl-1">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                triggerSave();
              }}
              className="p-1 hover:bg-red-200 rounded text-red-700 transition-colors"
              title="Réessayer"
            >
              <RefreshCcw className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  },
);

SalesGridCell.displayName = "SalesGridCell";
