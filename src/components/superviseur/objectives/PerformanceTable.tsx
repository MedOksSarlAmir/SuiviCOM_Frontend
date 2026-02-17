"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarRange, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useObjectiveStore } from "@/stores/supervisor/ObjectiveStore";

export function PerformanceTable() {
  const { performanceData, performanceDaysInfo, isPerfLoading, objectiveType } =
    useObjectiveStore();

  if (isPerfLoading)
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border">
        <Loader2 className="w-8 h-8 animate-spin text-amir-blue mb-2" />
        <p className="text-xs text-zinc-400 font-bold uppercase">
          Calcul des performances...
        </p>
      </div>
    );

  if (!performanceData || performanceData.length === 0)
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border text-zinc-400 italic">
        <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
        Aucun objectif trouvé pour cette sélection.
      </div>
    );

  return (
    <div className="space-y-6">
      {/* TIME INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="Jours Passés" value={performanceDaysInfo.passed} />
        <StatCard
          label="Jours Restants"
          value={performanceDaysInfo.remaining}
          highlight
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              <TableHead className="pl-6">Niveau</TableHead>
              <TableHead>Produit</TableHead>
              <TableHead className="text-center">Objectif</TableHead>
              <TableHead className="text-center">Réalisé</TableHead>
              <TableHead>Progrès</TableHead>
              {objectiveType == "vendor" ? (
                <TableHead className="text-center">Daily</TableHead>
              ) : (
                ""
              )}
              <TableHead className="text-right pr-6">Reste</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {performanceData.map((item: any) => (
              <TableRow key={item.product_id}>
                <TableCell className="pl-6">
                  {objectiveType === "vendor" ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      VENDEUR
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                      DISTRIBUTEUR
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  <p className="font-bold text-sm">{item.product_name}</p>
                  <p className="text-xs text-zinc-400 font-mono">
                    {item.product_code}
                  </p>
                </TableCell>

                <TableCell className="text-center font-bold">
                  {item.target}
                </TableCell>

                <TableCell className="text-center font-black">
                  {item.actual}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <span
                      className={cn(
                        "text-xs font-black",
                        item.achievement >= 100
                          ? "text-emerald-600"
                          : "text-amir-blue",
                      )}
                    >
                      {item.achievement}%
                    </span>

                    <div className="h-2 w-full bg-zinc-100 rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          item.achievement >= 100
                            ? "bg-emerald-500"
                            : "bg-amir-blue",
                        )}
                        style={{
                          width: `${Math.min(item.achievement, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </TableCell>

                {objectiveType == "vendor" ? (
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="border-amir-blue text-amir-blue font-bold"
                    >
                      {item.daily_target} / j
                    </Badge>
                  </TableCell>
                ) : (
                  ""
                )}
                <TableCell className="text-right pr-6 font-bold text-zinc-400">
                  {item.remaining_qty}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight = false }: any) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-zinc-400 uppercase">{label}</p>
        <p
          className={cn(
            "text-2xl font-black",
            highlight ? "text-amir-blue" : "text-zinc-900",
          )}
        >
          {value}
        </p>
      </div>

      <div className="bg-zinc-50 p-2 rounded-lg">
        <CalendarRange className="w-5 h-5 text-zinc-400" />
      </div>
    </div>
  );
}
