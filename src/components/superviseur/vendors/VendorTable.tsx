"use client";
import React, { memo } from "react";
import { useVendorStore } from "@/stores/VendorStore";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserMinus,
} from "lucide-react";

const VendorRow = memo(({ vendor, onEdit, onDelete }: any) => (
  <TableRow
    className="cursor-pointer hover:bg-indigo-50/30 transition-colors group"
    onClick={() => onEdit(vendor)}
  >
    <TableCell className="font-mono text-xs pl-6">{vendor.code}</TableCell>
    <TableCell className="font-bold text-zinc-800">
      {vendor.nom} {vendor.prenom}
    </TableCell>
    <TableCell>
      <Badge variant="outline" className="uppercase text-[10px]">
        {vendor.vendor_type}
      </Badge>
    </TableCell>
    <TableCell className="text-zinc-500 text-sm">
      {vendor.distributor_nom}
    </TableCell>
    <TableCell className="text-center">
      {vendor.active ? (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
          <UserCheck className="w-3 h-3 mr-1" /> Actif
        </Badge>
      ) : (
        <Badge className="bg-zinc-100 text-zinc-400 border-zinc-200">
          <UserMinus className="w-3 h-3 mr-1" /> Inactif
        </Badge>
      )}
    </TableCell>
    <TableCell className="text-right pr-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(vendor)}>
            <Edit className="w-4 h-4 mr-2" /> Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => onDelete(vendor.id, vendor.nom)}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
));
VendorRow.displayName = "VendorRow";

export function VendorTable({ onEdit }: { onEdit: (v: any) => void }) {
  const { vendors, isLoading, deleteVendor } = useVendorStore();

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Voulez-vous vraiment supprimer le vendeur ${name} ?`)) {
      const result = await deleteVendor(id);
      if (!result.success) alert(result.message);
    }
  };

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
          <TableHead className="pl-6">Code</TableHead>
          <TableHead>Vendeur</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Distributeur</TableHead>
          <TableHead className="text-center">Statut</TableHead>
          <TableHead className="w-[50px] pr-6"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vendors.map((v) => (
          <VendorRow
            key={v.id}
            vendor={v}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
}
