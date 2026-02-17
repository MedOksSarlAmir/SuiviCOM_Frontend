"use client";
import React, { useState, useEffect } from "react";
import { useObjectiveStore } from "@/stores/supervisor/ObjectiveStore";
import { Loader2, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export const ObjectiveGridCell = React.memo(
  ({
    productId,
    actorId,
    year,
    month,
    initialValue,
    rowIdx,
    colIdx,
    onKeyDown,
    inputRef,
  }: any) => {
    const [localVal, setLocalVal] = useState(initialValue.toString());
    const {
      stageObjectiveChange,
      upsertSingleObjective,
      isAutoSave,
      pendingChanges,
      isSavingCell,
      isErrorCell,
    } = useObjectiveStore();

    const cellKey = `${actorId}-${productId}`;
    const isSaving = isSavingCell[cellKey];
    const isError = isErrorCell[cellKey];
    const isDirty = !!pendingChanges[cellKey];

    useEffect(() => {
      setLocalVal(initialValue.toString());
    }, [initialValue]);

    const handleBlur = () => {
      const num = parseInt(localVal) || 0;
      const { objectiveType } = useObjectiveStore.getState();

      const payload: any = { product_id: productId, year, month, target: num };
      if (objectiveType === "vendor") payload.vendor_id = actorId;
      else payload.distributor_id = actorId;

      if (isAutoSave) {
        if (num === initialValue && !isError) return;
        upsertSingleObjective(payload);
      } else {
        stageObjectiveChange(payload, initialValue);
      }
    };

    return (
      <div
        className={cn(
          "relative h-full w-full transition-all border-2 border-transparent flex items-center",
          isDirty && "bg-amber-50/50 border-amber-200",
          isError && "bg-red-50 border-red-200",
          isSaving && "opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="number"
          value={localVal === "0" ? "" : localVal}
          placeholder="0"
          onFocus={(e) => e.target.select()}
          onChange={(e) => setLocalVal(e.target.value || "0")}
          onBlur={handleBlur}
          onKeyDown={(e) => onKeyDown(e, rowIdx, colIdx)}
          className={cn(
            "w-full h-10 text-center bg-transparent outline-none font-mono text-sm focus-visible:ring-0",
            localVal === "0" ? "text-zinc-300" : "text-zinc-900 font-bold",
            isError && "text-red-600",
          )}
        />
        {isSaving && (
          <Loader2 className="absolute right-1 w-3 h-3 animate-spin text-amir-blue" />
        )}
        {isError && !isSaving && (
          <button
            onClick={handleBlur}
            className="absolute right-1 text-red-500"
          >
            <RefreshCcw className="w-3 h-3" />
          </button>
        )}
        {isDirty && !isAutoSave && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-bl-sm" />
        )}
      </div>
    );
  },
);
ObjectiveGridCell.displayName = "ObjectiveGridCell";
