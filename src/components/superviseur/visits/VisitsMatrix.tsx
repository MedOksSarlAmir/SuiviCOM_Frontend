"use client";
import React, { useRef, useCallback } from "react";
import { useVisitStore } from "@/stores/VisitStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VisitGridCell } from "./VisitGridCell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function VisitsMatrix({ filters }: any) {
  const { matrixData, isLoading } = useVisitStore();
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
        <span className="text-zinc-400">
          Chargement de la force de vente...
        </span>
      </div>
    );

  return (
    <Table>
      <TableHeader className="bg-zinc-50 border-b">
        <TableRow>
          <TableHead className="w-[300px] border-r font-bold pl-6 py-4">
            Vendeur
          </TableHead>
          <TableHead className="w-[120px] text-center border-r text-zinc-500 uppercase text-[10px] font-bold">
            Programmées
          </TableHead>
          <TableHead className="w-[120px] text-center border-r text-zinc-500 uppercase text-[10px] font-bold">
            Effectuées
          </TableHead>
          <TableHead className="w-[120px] text-center border-r text-zinc-500 uppercase text-[10px] font-bold">
            Factures (BL)
          </TableHead>
          <TableHead className="text-center font-bold text-zinc-500 uppercase text-[10px]">
            Taux de visite
          </TableHead>
          <TableHead className="text-center font-bold text-zinc-500 uppercase text-[10px]">
            Taux de succes
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {matrixData.map((v, rowIdx) => {
          const coverage =
            v.planned > 0 ? Math.round((v.actual / v.planned) * 100) : 0;
          const successRate =
            v.planned > 0 ? Math.round((v.invoices / v.planned) * 100) : 0;
          return (
            <TableRow
              key={v.vendor_id}
              className={`hover:bg-zinc-50/50 ${v.active ? "" : "bg-gray-100"}`}
            >
              <TableCell className="border-r py-3 pl-6">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-800">
                    <span className="text-amir-blue/80 font-bold">
                      {v.vendor_code}
                    </span>{" "}
                    - {v.vendor_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 h-3.5 uppercase"
                    >
                      {v.vendor_type}
                    </Badge>
                  </div>
                </div>
              </TableCell>

              <TableCell className="p-0 border-r">
                <VisitGridCell
                  vendorId={v.vendor_id}
                  date={filters.date}
                  field="prog"
                  initialValue={v.planned}
                  rowIdx={rowIdx}
                  colIdx={0}
                  onKeyDown={handleKeyDown}
                  inputRef={(el: any) =>
                    (inputRefs.current[`cell-${rowIdx}-0`] = el)
                  }
                />
              </TableCell>

              <TableCell className="p-0 border-r">
                <VisitGridCell
                  vendorId={v.vendor_id}
                  date={filters.date}
                  field="actual"
                  initialValue={v.actual}
                  rowIdx={rowIdx}
                  colIdx={1}
                  onKeyDown={handleKeyDown}
                  inputRef={(el: any) =>
                    (inputRefs.current[`cell-${rowIdx}-1`] = el)
                  }
                />
              </TableCell>

              <TableCell className="p-0 border-r">
                <VisitGridCell
                  vendorId={v.vendor_id}
                  date={filters.date}
                  field="invoices"
                  initialValue={v.invoices}
                  rowIdx={rowIdx}
                  colIdx={2}
                  onKeyDown={handleKeyDown}
                  inputRef={(el: any) =>
                    (inputRefs.current[`cell-${rowIdx}-2`] = el)
                  }
                />
              </TableCell>

              <TableCell className="text-center">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "text-xs font-bold",
                      coverage >= 100
                        ? "text-emerald-600"
                        : coverage > 70
                          ? "text-amir-blue"
                          : "text-amber-600",
                    )}
                  >
                    {coverage}%
                  </span>
                  <div className="w-16 h-1 bg-zinc-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className={cn(
                        "h-full",
                        coverage >= 100
                          ? "bg-emerald-500"
                          : coverage > 70
                            ? "bg-amir-blue"
                            : "bg-amber-500",
                      )}
                      style={{ width: `${Math.min(coverage, 100)}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "text-xs font-bold",
                      successRate >= 100
                        ? "text-emerald-600"
                        : successRate > 70
                          ? "text-amir-blue"
                          : "text-amber-600",
                    )}
                  >
                    {successRate}%
                  </span>
                  <div className="w-16 h-1 bg-zinc-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className={cn(
                        "h-full",
                        successRate >= 100
                          ? "bg-emerald-500"
                          : successRate > 70
                            ? "bg-amir-blue"
                            : "bg-amber-500",
                      )}
                      style={{ width: `${Math.min(successRate, 100)}%` }}
                    />
                  </div>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
