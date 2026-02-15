"use client";
import React, { memo, useMemo } from "react";
import { usePurchaseStore } from "@/stores/supervisor/PurchaseStore";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Edit, Trash2, Box } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PurchaseRow = memo(({ purchase, onEdit, onDelete }: any) => {
  const productData = useMemo(() => {
    const list = purchase.products || [];
    const totalQty = list.reduce(
      (acc: number, p: any) => acc + (p.quantity || 0),
      0,
    );
    return { list, totalQty };
  }, [purchase.products]);

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "complete" || s === "validée")
      return <Badge className="bg-emerald-500">Validée</Badge>;
    return <Badge className="bg-amber-500">En cours</Badge>;
  };

  return (
    <TableRow
      className="hover:bg-zinc-50/50 cursor-pointer"
      onClick={() => onEdit(purchase)}
    >
      <TableCell className="font-mono text-xs pl-6">#{purchase.id}</TableCell>
      <TableCell>
        {purchase.date
          ? format(new Date(purchase.date), "dd MMM yyyy", { locale: fr })
          : "-"}
      </TableCell>
      <TableCell className="font-semibold">
        {purchase.distributor_name || purchase.distributeur_nom}
      </TableCell>

      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2 bg-white">
              <Box className="w-3.5 h-3.5" /> {productData.list.length} Réf.
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0 shadow-2xl" align="center">
            <div className="bg-zinc-900 text-white px-4 py-2 flex justify-between items-center rounded-t-md text-xs font-bold uppercase tracking-widest">
              Détail de l&apos;achat
              <span className="bg-zinc-700 px-2 py-0.5 rounded">
                {productData.totalQty} Unités
              </span>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-zinc-50 border-b">
                  <tr>
                    <th className="text-left p-2">Produit</th>
                    <th className="text-center p-2">Qté</th>
                    <th className="text-right p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.list.map((p: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-2">{p.name}</td>
                      <td className="p-2 text-center font-bold">
                        {p.quantity}
                      </td>
                      <td className="p-2 text-right">
                        {(p.quantity * (p.unit_price || 0)).toLocaleString()} DA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>

      <TableCell className="text-right font-bold text-amir-blue">
        {new Intl.NumberFormat("fr-DZ").format(
          purchase.montant_total || purchase.total_amount,
        )}
        <span className="text-[10px] text-zinc-400 ml-1">DA</span>
      </TableCell>

      <TableCell className="text-center">
        {getStatusBadge(purchase.status)}
      </TableCell>

      <TableCell
        className="text-right pr-6"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(purchase)}>
              <Edit className="w-4 h-4 mr-2" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onSelect={() => onDelete(purchase.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});
PurchaseRow.displayName = "PurchaseRow";

export function PurchasesTable({ onEdit }: { onEdit: (p: any) => void }) {
  const { purchases, isLoading, deletePurchase } = usePurchaseStore();
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
          <TableHead className="w-[80px] pl-6">ID</TableHead>
          <TableHead className="w-[150px]">Date</TableHead>
          <TableHead>Distributeur</TableHead>
          <TableHead className="text-center">Détails</TableHead>
          <TableHead className="text-right">Montant Total</TableHead>
          <TableHead className="text-center">Statut</TableHead>
          <TableHead className="w-[50px] pr-6"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map((p) => (
          <PurchaseRow
            key={p.id}
            purchase={p}
            onEdit={onEdit}
            onDelete={deletePurchase}
          />
        ))}
      </TableBody>
    </Table>
  );
}
