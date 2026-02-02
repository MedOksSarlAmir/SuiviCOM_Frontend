"use client";
import React, { useState, useEffect } from "react";
import { useVisitStore } from "@/stores/VisitStore";
import { Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const VisitGridCell = React.memo(
  ({
    vendorId,
    date,
    field,
    initialValue,
    rowIdx,
    colIdx,
    onKeyDown,
    inputRef,
  }: any) => {
    const [val, setVal] = useState(() => initialValue.toString());
    const upsert = useVisitStore((s) => s.upsertVisitCell);

    const cellKey = `${vendorId}-${field}`;
    const isSaving = useVisitStore((s) => s.isSavingCell[cellKey]);
    const isError = useVisitStore((s) => s.isErrorCell[cellKey]);

    const triggerSave = async (forcedValue?: string) => {
      const num = parseInt(forcedValue ?? val) || 0;
      // Don't save if it hasn't changed AND there is no error to clear
      if (num === initialValue && !isError) return;

      await upsert({ vendor_id: vendorId, date, field, value: num });
    };

    return (
      <div
        className={cn(
          "relative h-full w-full transition-colors",
          isError && "bg-red-50",
        )}
      >
        <input
          ref={inputRef}
          type="number"
          value={val}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            setVal(e.target.value);
          }}
          onBlur={() => triggerSave()}
          onKeyDown={(e) => onKeyDown(e, rowIdx, colIdx)}
          className={cn(
            "w-full h-12 text-center bg-transparent outline-none transition-all font-mono text-sm border-none focus-visible:ring-0",
            val === "0" ? "text-zinc-300" : "text-zinc-900 font-bold",
            isSaving && "opacity-50",
            isError && "text-red-600 ring-1 ring-inset ring-red-500",
          )}
        />

        {/* Saving Indicator */}
        {isSaving && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="w-3 h-3 animate-spin text-amir-blue" />
          </div>
        )}

        {/* Error State + Retry Button */}
        {isError && !isSaving && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerSave();
              }}
              className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
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

VisitGridCell.displayName = "VisitGridCell";
