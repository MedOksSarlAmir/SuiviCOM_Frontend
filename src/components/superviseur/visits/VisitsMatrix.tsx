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
        const el = inputRefs.current[`cell-${r + dr}-${c + dc}`];
        if (el) {
          el.focus();
          el.select();
        }
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
      <div className="h-96 flex flex-col items-center justify-center bg-white border border-zinc-200 rounded-xl">
        <Loader2 className="w-10 h-10 animate-spin text-amir-blue mb-4" />
        <span className="text-zinc-400">
          Chargement de la force de vente...
        </span>
      </div>
    );

  return (
    <div className="border border-zinc-200 bg-white rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-zinc-50 border-b">
          <TableRow>
            <TableHead className="w-[300px] border-r font-bold pl-6 py-4">
              Vendeur
            </TableHead>
            <TableHead className="w-[120px] text-center border-r text-zinc-500 uppercase text-[10px] font-bold">
              Prog.
            </TableHead>
            <TableHead className="w-[120px] text-center border-r text-zinc-500 uppercase text-[10px] font-bold">
              Eff.
            </TableHead>
            <TableHead className="w-[120px] text-center border-r text-zinc-500 uppercase text-[10px] font-bold">
              Factures
            </TableHead>
            <TableHead className="text-center font-bold text-zinc-500 uppercase text-[10px]">
              Couverture
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matrixData.map((v, rowIdx) => {
            const coverage =
              v.prog > 0 ? Math.round((v.done / v.prog) * 100) : 0;

            return (
              <TableRow key={v.vendor_id} className="hover:bg-zinc-50/50">
                <TableCell className="border-r py-3 pl-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-800">
                      {v.vendor_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {v.vendor_code}
                      </span>
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
                    initialValue={v.prog}
                    rowIdx={rowIdx}
                    colIdx={0}
                    onKeyDown={handleKeyDown}
                    inputRef={(el:any) =>
                      (inputRefs.current[`cell-${rowIdx}-0`] = el)
                    }
                  />
                </TableCell>

                <TableCell className="p-0 border-r">
                  <VisitGridCell
                    vendorId={v.vendor_id}
                    date={filters.date}
                    field="done"
                    initialValue={v.done}
                    rowIdx={rowIdx}
                    colIdx={1}
                    onKeyDown={handleKeyDown}
                    inputRef={(el) =>
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
                    inputRef={(el) =>
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
                          "h-full transition-all",
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
