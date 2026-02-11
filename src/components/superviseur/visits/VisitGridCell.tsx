"use client";
import React, { useState, useEffect } from "react";
import { useVisitStore } from "@/stores/VisitStore";
import { Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const [localVal, setLocalVal] = useState(initialValue.toString());

    const isAutoSave = useVisitStore((s) => s.isAutoSave);
    const upsert = useVisitStore((s) => s.upsertVisitCell);
    const stage = useVisitStore((s) => s.stageChange);

    const cellKey = `${vendorId}-${field}`;
    const isSaving = useVisitStore((s) => s.isSavingCell[cellKey]);
    const isError = useVisitStore((s) => s.isErrorCell[cellKey]);
    const isDirty = useVisitStore((s) => !!s.pendingChanges[cellKey]);

    // Update local state if initialValue changes (e.g. on new fetch)
    useEffect(() => {
      setLocalVal(initialValue.toString());
    }, [initialValue]);

    const handleBlur = () => {
      const num = parseInt(localVal) || 0;
      const payload = { vendor_id: vendorId, date, field, value: num };

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
            "w-full h-12 text-center bg-transparent outline-none font-mono text-sm focus-visible:ring-0",
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
          <div
            className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-bl-sm"
            title="Non enregistré"
          />
        )}

        {isError && !isSaving && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={handleBlur}
              className="p-1 hover:bg-red-100 rounded text-red-600"
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
