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
        <Loader2 className="animate-spin text-amir-blue" />
      </div>
    );

  const dayNames = ["Sam", "Dim", "Lun", "Mar", "Mer", "Jeu"];

  return (
    <Table className="min-w-[1000px]">
      <TableHeader className="bg-zinc-50 border-b">
        <TableRow>
          <TableHead className="w-[300px] border-r font-bold pl-6">
            Produit
          </TableHead>
          {dayNames.map((day, i) => (
            <TableHead key={i} className="text-center border-r w-[120px] p-2">
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold">{day}</span>
                <span className="text-[10px] text-zinc-400">
                  {weeklyDates?.[i]
                    ?.split("-")
                    .reverse()
                    .slice(0, 2)
                    .join("/") || "--/--"}
                </span>
                {weeklyDates?.[i] && (
                  <Select
                    value={weeklyStatuses[weeklyDates[i]] || "complete"}
                    onValueChange={(v) =>
                      updateSaleStatus({
                        vendor_id: Number(filters.vendor_id),
                        distributor_id: Number(filters.distributor_id),
                        date: weeklyDates[i],
                        status: v,
                      })
                    }
                  >
                    <SelectTrigger className="h-6 text-[9px] font-bold w-20 px-1">
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
          ))}
          <TableHead className="text-center bg-zinc-100/50 font-bold w-[100px]">
            Total
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {weeklyData.map((prod, rowIdx) => {
          const total = prod.days.reduce((a, b) => a + b, 0);
          if (!prod.active) return null;
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
                  <span className="text-sm font-semibold truncate">
                    {prod.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">
                    {prod.code} {prod.price ? `- ${prod.price} DA` : ""}
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
  );
}
