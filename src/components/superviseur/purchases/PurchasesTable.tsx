"use client";
import React, { useState, memo, useMemo, useCallback } from "react";
import { usePurchaseStore, Purchase } from "@/stores/PurchaseStore";
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
import {
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  PackageSearch,
  Box,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { EditPurchaseModal } from "./EditPurchaseModal";

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
    if (s.includes("complete") || s.includes("valid"))
      return <Badge className="bg-emerald-500">Validée</Badge>;
    if (s.includes("cours"))
      return <Badge className="bg-amber-500">En cours</Badge>;
    return <Badge variant="destructive">Annulée</Badge>;
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
        {purchase.distributeur_nom}
      </TableCell>

      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2 bg-white">
              <Box className="w-3.5 h-3.5" /> {productData.list.length} Réf.
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[450px] p-0 shadow-2xl" align="center">
            <div className="bg-zinc-900 text-white px-4 py-3 flex justify-between items-center rounded-t-md">
              <span className="text-xs font-bold uppercase tracking-widest">
                Détail de l&apos;approvisionnement
              </span>
              <span className="text-[10px] bg-zinc-700 px-2 py-1 rounded">
                Total: {productData.totalQty} Unités
              </span>
            </div>
            <div className="max-h-[350px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-[10px] uppercase text-zinc-500 border-b">
                  <tr>
                    <th className="text-left p-3">Produit</th>
                    <th className="text-center p-3">Qté</th>
                    <th className="text-right p-3">P.U</th>
                    <th className="text-right p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.list.map((p: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b last:border-0 hover:bg-zinc-50/50"
                    >
                      <td className="p-3 font-medium">{p.designation}</td>
                      <td className="p-3 text-center bg-zinc-50/50 font-bold">
                        {p.quantity}
                      </td>
                      <td className="p-3 text-right text-zinc-500">
                        {p.unit_price}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {(p.quantity * p.unit_price).toLocaleString()}
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
        {new Intl.NumberFormat("fr-DZ").format(purchase.montant_total)}{" "}
        <span className="text-[10px] text-zinc-400">DA</span>
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
            <DropdownMenuItem onClick={() => onEdit(purchase)}>
              <Edit className="w-4 h-4 mr-2" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(purchase.id)}
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

export function PurchasesTable() {
  const { purchases, isLoading, deletePurchase } = usePurchaseStore();
  const [selected, setSelected] = useState<Purchase | null>(null);

  if (isLoading)
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-amir-blue" />
      </div>
    );

  return (
    <>
      <Table>
        <TableHeader className="bg-zinc-50">
          <TableRow>
            <TableHead className="w-[80px] pl-6">ID</TableHead>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead>Distributeur</TableHead>
            <TableHead className="text-center">Détails Produits</TableHead>
            <TableHead className="text-right">Montant Total</TableHead>
            <TableHead className="text-center">Statut</TableHead>
            <TableHead className="w-[50px] pr-6"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-40 text-center text-zinc-400">
                Aucun achat trouvé
              </TableCell>
            </TableRow>
          ) : (
            purchases.map((p) => (
              <PurchaseRow
                key={p.id}
                purchase={p}
                onEdit={setSelected}
                onDelete={deletePurchase}
              />
            ))
          )}
        </TableBody>
      </Table>
      {selected && (
        <EditPurchaseModal
          purchase={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
