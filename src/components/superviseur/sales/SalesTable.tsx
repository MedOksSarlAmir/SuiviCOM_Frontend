"use client";
import React, { useState, memo, useMemo, useCallback } from "react";
import { useSalesStore, Sale } from "@/stores/SaleStore";
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
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Box,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { EditSaleModal } from "./EditSaleModal";

// --- 1. MEMOIZED ROW COMPONENT ---
// This component only re-renders if the specific 'sale' object changes.
const SaleRow = memo(
  ({
    sale,
    onEdit,
    onDelete,
  }: {
    sale: Sale;
    onEdit: (s: Sale) => void;
    onDelete: (id: number) => void;
  }) => {
    // Memoize product parsing to avoid doing it on every render
    const productData = useMemo(() => {
      const list = sale.products || [];
      const total = list.reduce(
        (acc: any, p: any) => acc + (p.quantity || 0),
        0,
      );
      return { list, total };
    }, [sale.products]);

    const getStatusBadge = (status: string) => {
      const s = status?.toLowerCase() || "";
      if (s.includes("valid") || s.includes("complete"))
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600">Validée</Badge>
        );
      if (s.includes("cours"))
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">En cours</Badge>
        );
      if (s.includes("annul"))
        return <Badge variant="destructive">Annulée</Badge>;
      return <Badge variant="outline">{status}</Badge>;
    };

    return (
      <TableRow
        className="cursor-pointer hover:bg-indigo-50/30 transition-colors group"
        onClick={() => onEdit(sale)}
      >
        <TableCell className="font-mono text-xs text-zinc-500 pl-6">
          #{sale.id}
        </TableCell>
        <TableCell className="text-sm">
          {sale.date
            ? format(new Date(sale.date), "dd MMM yyyy", { locale: fr })
            : "-"}
        </TableCell>
        <TableCell className="font-medium text-zinc-800">
          {sale.distributeur_nom || "N/A"}
        </TableCell>
        <TableCell className="text-zinc-600 text-sm">
          {sale.vendeur_prenom?.[0]}.{sale.vendeur_nom || "N/A"}
        </TableCell>

        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-dashed gap-1.5 bg-transparent"
              >
                <Box className="w-3.5 h-3.5" />
                {productData.list.length} Produits
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-96 p-0 shadow-xl border-zinc-200"
              align="center"
            >
              <div className="bg-zinc-50 px-3 py-2 border-b text-[10px] font-bold text-zinc-500 uppercase flex justify-between">
                <span>Détails (#{sale.id})</span>
                <span>Qte Total : {productData.total}</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {productData.list.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b hover:bg-zinc-50 items-center"
                  >
                    <div className="col-span-8 flex flex-col">
                      <span className="text-sm font-medium text-zinc-800 truncate">
                        {p.designation}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-xs font-bold text-zinc-700 bg-zinc-200 px-1.5 py-0.5 rounded">
                        x{p.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </TableCell>

        <TableCell className="text-center">
          {getStatusBadge(sale.status)}
        </TableCell>

        <TableCell
          className="text-right pr-6"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-700"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(sale)}>
                <Edit className="w-4 h-4 mr-2" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(sale.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  },
);
SaleRow.displayName = "SaleRow";

// --- 2. MAIN TABLE COMPONENT ---
export function SalesTable() {
  // Pull only specific parts of the store (Selective Selection)
  const sales = useSalesStore((state) => state.sales);
  const isLoading = useSalesStore((state) => state.isLoading);
  const deleteSale = useSalesStore((state) => state.deleteSale);

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Wrap handlers in useCallback so the memoized row doesn't re-render unnecessarily
  const handleEdit = useCallback((sale: Sale) => {
    setSelectedSale(sale);
    setIsEditOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: number) => {
      if (confirm("Voulez-vous vraiment supprimer cette vente ?")) {
        deleteSale(id);
      }
    },
    [deleteSale],
  );

  if (isLoading)
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-amir-blue h-8 w-8" />
      </div>
    );

  return (
    <>
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50/80">
            <TableRow>
              <TableHead className="w-[80px] pl-6">ID</TableHead>
              <TableHead className="w-[140px]">Date</TableHead>
              <TableHead>Distributeur</TableHead>
              <TableHead>Vendeur</TableHead>
              <TableHead className="text-center">Produits</TableHead>
              <TableHead className="text-center">Statut</TableHead>
              <TableHead className="w-[50px] pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-40 text-center text-zinc-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-10 h-10 opacity-20" />
                    <p>Aucune vente trouvée</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <SaleRow
                  key={sale.id}
                  sale={sale}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedSale && (
        <EditSaleModal
          sale={selectedSale}
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  );
}
