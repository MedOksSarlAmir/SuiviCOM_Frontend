// src/components/superviseur/objectives/ObjectivesMatrix.tsx
"use client";
import React, { useRef, useCallback } from "react";
import { useObjectiveStore } from "@/stores/supervisor/ObjectiveStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ObjectiveGridCell } from "./ObjectiveGridCell";
import { Loader2 } from "lucide-react";

export function ObjectivesMatrix({ filters }: any) {
  const { matrixData, matrixHeaders, isLoading, objectiveType } =
    useObjectiveStore();
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, r: number, c: number) => {
      const move = (dr: number, dc: number) => {
        e.preventDefault();
        inputRefs.current[`cell-${r + dr}-${c + dc}`]?.focus();
      };
      if (e.key === "ArrowDown" || e.key === "Enter") move(1, 0);
      if (e.key === "ArrowUp") move(-1, 0);
      if (e.key === "ArrowRight") move(0, 1);
      if (e.key === "ArrowLeft") move(0, -1);
    },
    [],
  );

  if (isLoading)
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-amir-blue mb-4" />
        <span className="text-zinc-400">Chargement...</span>
      </div>
    );

  if (matrixHeaders.length === 0)
    return (
      <div className="h-40 flex items-center justify-center text-zinc-400 italic">
        {objectiveType === "vendor"
          ? "Aucun vendeur trouvé."
          : "Sélectionnez un distributeur."}
      </div>
    );

  return (
    <Table>
      <TableHeader className="bg-zinc-50 border-b">
        <TableRow>
          <TableHead className="w-[300px] border-r font-bold pl-6">
            Produit
          </TableHead>
          {matrixHeaders.map((h) => (
            <TableHead
              key={h.id}
              className="text-center border-r w-[150px] p-2"
            >
              <div className="flex flex-col items-center">
                {h.code && (
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {h.code}
                  </span>
                )}
                <span className="font-bold text-xs truncate max-w-[140px]">
                  {h.name}
                </span>
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {matrixData.map((row, rowIdx) => (
          <TableRow key={row.product_id} className="hover:bg-zinc-50/50">
            <TableCell className="border-r py-2 pl-6">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {row.product_name}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono uppercase">
                  {row.product_code}
                </span>
              </div>
            </TableCell>
            {matrixHeaders.map((header, colIdx) => (
              <TableCell key={header.id} className="p-0 border-r h-10">
                <ObjectiveGridCell
                  productId={row.product_id}
                  actorId={header.id} // This is vendor_id or distributor_id
                  year={filters.year}
                  month={filters.month}
                  initialValue={row.targets[header.id] || 0}
                  rowIdx={rowIdx}
                  colIdx={colIdx}
                  onKeyDown={handleKeyDown}
                  inputRef={(el: any) =>
                    (inputRefs.current[`cell-${rowIdx}-${colIdx}`] = el)
                  }
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
