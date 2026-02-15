"use client";
import React, { useState, useEffect } from "react";
import { useSalesStore } from "@/stores/supervisor/SaleStore";
import { Loader2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

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
  }: any) => {
    const [localVal, setLocalVal] = useState(initialValue.toString());

    const isAutoSave = useSalesStore((s) => s.isAutoSave);
    const upsert = useSalesStore((s) => s.upsertSaleItem);
    const stage = useSalesStore((s) => s.stageSaleChange);

    const cellKey = `${productId}-${date}`;
    const isSaving = useSalesStore((s) => s.isSavingCell[cellKey]);
    const isError = useSalesStore((s) => s.isErrorCell[cellKey]);
    const isDirty = useSalesStore((s) => !!s.pendingChanges[cellKey]);

    useEffect(() => {
      setLocalVal(initialValue.toString());
    }, [initialValue]);

    const handleBlur = () => {
      const num = parseInt(localVal) || 0;
      const payload = {
        vendor_id: Number(context.vendor_id),
        distributor_id: Number(context.distributor_id),
        product_id: productId,
        date,
        quantity: num,
      };

      if (isAutoSave) {
        if (num === initialValue && !isError) return;
        upsert(payload);
      } else {
        stage(payload, initialValue);
      }
    };

    return (
      <div
        className={cn(
          "relative h-full w-full transition-all border-2 border-transparent",
          isDirty && "bg-amber-50/50 border-amber-200",
          isError && "bg-red-50 border-red-200",
        )}
      >
        <input
          ref={inputRef}
          type="number"
          // 🔹 CHANGE: Show empty string if value is "0"
          value={localVal === "0" ? "" : localVal}
          placeholder="0"
          onFocus={(e) => e.target.select()}
          onChange={(e) => setLocalVal(e.target.value || "0")} // 🔹 Map empty back to "0"
          onBlur={handleBlur}
          onKeyDown={(e) => onKeyDown(e, rowIdx, colIdx)}
          className={cn(
            "w-full h-10 text-center bg-transparent outline-none font-mono text-sm focus-visible:ring-0",
            localVal === "0" ? "text-zinc-300" : "text-zinc-900 font-bold",
            isSaving && "opacity-50",
            isError && "text-red-600",
          )}
        />
        {isSaving && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <Loader2 className="w-3 h-3 animate-spin text-amir-blue" />
          </div>
        )}
        {isDirty && !isSaving && !isError && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-bl-sm" />
        )}
        {isError && !isSaving && (
          <button
            onClick={handleBlur}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-red-600"
          >
            <RefreshCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  },
);
SalesGridCell.displayName = "SalesGridCell";
