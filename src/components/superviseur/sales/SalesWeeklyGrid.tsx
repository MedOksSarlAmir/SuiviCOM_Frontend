"use client";
import React, { useRef, useCallback } from "react";
import { useSalesStore } from "@/stores/SaleStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SalesGridCell } from "./SalesGridCell";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function SalesWeeklyGrid({ filters }: any) {
  const {
    weeklyData,
    weeklyDates,
    weeklyStatuses,
    isLoading,
    updateSaleStatus,
  } = useSalesStore();
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
        <span className="text-zinc-400">Chargement de la matrice...</span>
      </div>
    );

  const dayNames = ["Sam", "Dim", "Lun", "Mar", "Mer", "Jeu"];

  return (
    <div className="border-x border-zinc-200 bg-white overflow-x-auto">
      <Table className="min-w-[1000px]">
        <TableHeader className="bg-zinc-50 border-b border-zinc-200">
          <TableRow>
            <TableHead className="w-[320px] border-r font-bold pl-6 py-4">
              Désignation Produit
            </TableHead>
            {dayNames.map((day, i) => {
              const d = weeklyDates?.[i];
              return (
                <TableHead
                  key={i}
                  className="text-center border-r w-[120px] p-2"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-zinc-900">{day}</span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      {d
                        ? new Date(d).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                          })
                        : "--/--"}
                    </span>
                    {d && (
                      <Select
                        value={weeklyStatuses[d] || "complete"}
                        onValueChange={(v) =>
                          updateSaleStatus({
                            vendor_id: Number(filters.vendor_id),
                            distributor_id: Number(filters.distributor_id),
                            date: d,
                            status: v,
                          })
                        }
                      >
                        <SelectTrigger className="h-6 text-[9px] font-bold uppercase w-20 px-1 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en_cours" className="text-[10px]">
                            🔴 En cours
                          </SelectItem>
                          <SelectItem value="complete" className="text-[10px]">
                            🟢 Validée
                          </SelectItem>
                          <SelectItem value="annulee" className="text-[10px]">
                            ⚪ Annulée
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </TableHead>
              );
            })}
            <TableHead className="text-center bg-zinc-100/50 font-bold w-[100px]">
              Total
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {weeklyData.map((prod, rowIdx) => {
            const total = prod.days.reduce((a, b) => a + b, 0);
            if (!prod.active && total === 0) return null;
            return (
              <TableRow
                key={prod.product_id}
                className={cn(
                  "hover:bg-zinc-50/50",
                  !prod.active && "bg-zinc-50/80 opacity-60",
                )}
              >
                <TableCell className="border-r py-2 pl-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold truncate w-[260px]">
                      {prod.designation}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono uppercase">
                      {prod.code}
                    </span>
                  </div>
                </TableCell>
                {weeklyDates.map((date, colIdx) => (
                  <TableCell key={date} className="p-0 border-r h-10">
                    <SalesGridCell
                      productId={prod.product_id}
                      date={date}
                      initialValue={prod.days[colIdx]}
                      rowIdx={rowIdx}
                      colIdx={colIdx}
                      onKeyDown={handleKeyDown}
                      inputRef={(el: any) =>
                        (inputRefs.current[`cell-${rowIdx}-${colIdx}`] = el)
                      }
                      context={filters}
                    />
                  </TableCell>
                ))}
                <TableCell className="text-center font-black text-amir-blue bg-zinc-50/30">
                  {total}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
