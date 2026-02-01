"use client";
import React, { memo } from "react";
import { useVisitStore } from "@/stores/VisitStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Edit, Trash2, MapPin } from "lucide-react";
import { format } from "date-fns";

const VisitRow = memo(({ visit, onEdit, onDelete }: any) => (
  <TableRow
    className="cursor-pointer hover:bg-indigo-50/30 transition-colors group"
    onClick={() => onEdit(visit)}
  >
    <TableCell className="text-sm font-medium pl-6">
      {visit.date ? format(new Date(visit.date), "dd/MM/yyyy") : "-"}
    </TableCell>
    <TableCell className="font-semibold text-zinc-800">
      {visit.distributeur_nom}
    </TableCell>
    <TableCell className="text-zinc-600">
      {visit.vendeur_prenom?.[0]}. {visit.vendeur_nom}
    </TableCell>
    <TableCell className="text-center">
      <div className="flex items-center justify-center gap-2">
        <span className="text-zinc-400 text-xs">
          {visit.visites_programmees}
        </span>
        <span className="font-bold text-amir-blue">/</span>
        <span className="font-bold text-zinc-900">
          {visit.visites_effectuees}
        </span>
      </div>
    </TableCell>
    <TableCell className="text-center font-bold text-emerald-600">
      {visit.nb_factures}
    </TableCell>
    <TableCell>
      <Badge
        variant="outline"
        className={
          visit.status.includes("non")
            ? "text-amber-600 border-amber-200 bg-amber-50"
            : "text-emerald-600 border-emerald-200 bg-emerald-50"
        }
      >
        {visit.status}
      </Badge>
    </TableCell>
    <TableCell className="text-right pr-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(visit)}>
            <Edit className="w-4 h-4 mr-2" /> Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => onDelete(visit.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
));
VisitRow.displayName = "VisitRow";

export function VisitsTable({ onEdit }: { onEdit: (v: any) => void }) {
  const { visits, isLoading, deleteVisit } = useVisitStore();

  if (isLoading)
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-amir-blue" />
      </div>
    );

  return (
    <Table>
      <TableHeader className="bg-zinc-50">
        <TableRow>
          <TableHead className="pl-6">Date</TableHead>
          <TableHead>Distributeur</TableHead>
          <TableHead>Vendeur</TableHead>
          <TableHead className="text-center">Eff / Prog</TableHead>
          <TableHead className="text-center">Factures</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="w-[50px] pr-6"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visits.map((v) => (
          <VisitRow
            key={v.id}
            visit={v}
            onEdit={onEdit}
            onDelete={deleteVisit}
          />
        ))}
      </TableBody>
    </Table>
  );
}
