"use client";
import React from "react";
import { useAdminProductStore } from "@/stores/admin/ProductStore";
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
import { Edit, PackageSearch } from "lucide-react";

export function ProductTable({ onEdit }: { onEdit: (p: any) => void }) {
  const { products, isLoading } = useAdminProductStore();

  if (isLoading)
    return (
      <div className="h-64 flex items-center justify-center text-zinc-400">
        Chargement du catalogue...
      </div>
    );
  return (
    <Table>
      <TableHeader className="bg-zinc-50">
        <TableRow>
          <TableHead className="pl-6">Code</TableHead>
          <TableHead>Désignation</TableHead>
          <TableHead>Famille</TableHead>
          <TableHead>Prix Usine</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right pr-6">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="h-40 text-center text-zinc-400 italic"
            >
              <PackageSearch className="mx-auto w-8 h-8 opacity-20 mb-2" />
              Aucun produit trouvé.
            </TableCell>
          </TableRow>
        ) : (
          products.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-xs pl-6">{p.code}</TableCell>
              <TableCell className="font-bold">{p.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{p.category}</Badge>
              </TableCell>
              <TableCell className="font-semibold text-amir-blue">
                {p.price_factory?.toLocaleString()} DA
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    p.active
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                      : "bg-zinc-100 text-zinc-400"
                  }
                >
                  {p.active ? "Actif" : "Inactif"}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-6">
                <Button variant="ghost" size="icon" onClick={() => onEdit(p)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
