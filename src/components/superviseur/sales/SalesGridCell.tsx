"use client";
import React, { useState, useEffect } from "react";
import { useSalesStore } from "@/stores/SaleStore";
import { Loader2 } from "lucide-react";
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
    const [val, setVal] = useState(initialValue.toString());
    const upsert = useSalesStore((s) => s.upsertSaleItem);
    const isSaving = useSalesStore(
      (s) => s.isSavingCell[`${productId}-${date}`],
    );

    useEffect(() => setVal(initialValue.toString()), [initialValue]);

    const handleBlur = async () => {
      const num = parseInt(val) || 0;
      if (num === initialValue) return;
      await upsert({
        vendor_id: Number(context.vendor_id),
        distributor_id: Number(context.distributor_id),
        product_id: productId,
        date,
        quantity: num,
      });
    };

    return (
      <div className="relative h-full w-full">
        <input
          ref={inputRef}
          type="number"
          value={val}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => onKeyDown(e, rowIdx, colIdx)}
          className={cn(
            "w-full h-10 text-center bg-transparent outline-none transition-all font-mono text-sm border-none focus-visible:ring-0",
            val === "0" ? "text-zinc-300" : "text-zinc-900 font-bold",
            isSaving ? "bg-amir-blue/10" : "focus:bg-amir-blue/5",
          )}
        />
        {isSaving && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="w-3 h-3 animate-spin text-amir-blue" />
          </div>
        )}
      </div>
    );
  },
);
SalesGridCell.displayName = "SalesGridCell";
