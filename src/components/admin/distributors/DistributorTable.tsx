"use client";
import React from "react";
import { useAdminDistributorStore } from "@/stores/AdminDistributorStore";
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
import { Edit, Trash2, MapPin, Loader2, Users } from "lucide-react";

interface DistributorTableProps {
  onEdit: (distributor: any) => void;
}

export function DistributorTable({ onEdit }: DistributorTableProps) {
  const { distributors, isLoading, deleteDistributor } =
    useAdminDistributorStore();

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
          <TableHead className="pl-6">Nom Distributeur</TableHead>
          <TableHead>Localisation (Wilaya)</TableHead>
          <TableHead className="text-center">Vendeurs</TableHead>
          <TableHead className="text-right pr-6">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {distributors.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="h-40 text-center text-zinc-400 italic"
            >
              Aucun distributeur trouvé.
            </TableCell>
          </TableRow>
        ) : (
          distributors.map((d) => (
            <TableRow key={d.id} className="hover:bg-zinc-50/50">
              <TableCell className="pl-6 font-bold text-zinc-800">
                {d.name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />{" "}
                  {d.wilaya_name || "N/A"}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="gap-1.5 font-mono">
                  <Users className="w-3 h-3" /> {d.vendor_count || 0}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-6 space-x-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(d)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (confirm("Supprimer ce distributeur ?"))
                      deleteDistributor(d.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
