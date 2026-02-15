"use client";
import React, { useEffect } from "react";
import { useAdminDistributorStore } from "@/stores/admin/DistributorStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Loader2, Store, User as UserIcon, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function DistributorTable({ onEdit }: { onEdit: (d: any) => void }) {
  const { distributors, isLoading } = useAdminDistributorStore();
  if (isLoading)
    return (
      <div className="h-96 flex flex-col items-center justify-center text-zinc-400 bg-white">
        <Loader2 className="animate-spin w-10 h-10 mb-4 text-amir-blue" />
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Lecture des partenaires...
        </span>
      </div>
    );

  return (
    <Table>
      <TableHeader className="bg-zinc-50/50">
        <TableRow>
          <TableHead className="pl-8 h-14">Distributeur</TableHead>
          <TableHead>Localisation</TableHead>
          <TableHead>Superviseur</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right pr-8">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {distributors.map((d) => (
          <TableRow
            key={d.id}
            className="hover:bg-zinc-50 transition-colors group"
          >
            <TableCell className="pl-8 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-amir-blue group-hover:text-white transition-all shadow-sm">
                  <Store size={18} />
                </div>
                <span className="font-bold text-zinc-900 text-sm">
                  {d.name}
                </span>
              </div>
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-xs">
                <MapPin className="w-3 h-3 text-zinc-400" />
                {d.wilaya_code} - {d.wilaya_name}
              </div>
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <UserIcon size={12} />
                </div>
                <span
                  className={cn(
                    "text-xs font-bold",
                    d.supervisor_id ? "text-zinc-700" : "text-amber-500 italic",
                  )}
                >
                  {d.supervisor_name}
                </span>
              </div>
            </TableCell>

            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  "font-black uppercase text-[9px] px-2 py-0.5 border-none",
                  d.active
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-zinc-100 text-zinc-400",
                )}
              >
                {d.active ? "Actif" : "Inactif"}
              </Badge>
            </TableCell>

            <TableCell className="text-right pr-8">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-zinc-400 hover:text-amir-blue hover:bg-zinc-50 rounded-full"
                onClick={() => onEdit(d)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
