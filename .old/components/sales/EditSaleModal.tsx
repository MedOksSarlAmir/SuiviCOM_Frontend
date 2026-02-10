"use client";
import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useSalesStore, Sale } from "@/stores/SaleStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// 1. Memoized Row to prevent lag during typing/selection
const SaleRow = memo(
  ({
    index,
    item,
    products,
    onProductChange,
    onQtyChange,
    onRemove,
    isRemovable,
  }: any) => {
    return (
      <TableRow className="hover:bg-zinc-50 border-b-zinc-50">
        <TableCell className="pl-4 py-2">
          <Select
            value={item.product_id?.toString()}
            onValueChange={(v) => onProductChange(index, v)}
          >
            <SelectTrigger className="border-0 shadow-none h-8 px-0 w-full focus:ring-0 bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {products.map((p: any) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.code} - {p.designation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="py-2 flex justify-center">
          <Input
            type="number"
            className="h-8 w-20 text-center"
            value={item.quantity}
            onChange={(e) => onQtyChange(index, e.target.value)}
          />
        </TableCell>
        <TableCell>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500"
            onClick={() => onRemove(index)}
            disabled={!isRemovable} // PREVENT DELETING LAST ROW
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </TableCell>
      </TableRow>
    );
  },
);
SaleRow.displayName = "SaleRow";

interface EditSaleModalProps {
  sale: any;
  open: any;
  onClose: () => void;
}

export function EditSaleModal({ sale, open, onClose }: EditSaleModalProps) {
  // Selectors: Only listen to what is absolutely necessary
  const products = useSalesStore((s) => s.products);
  const updateSale = useSalesStore((s) => s.updateSale);
  const fetchDependencies = useSalesStore((s) => s.fetchDependencies);
  const distributors = useSalesStore((s) => s.distributors);
  const fetchVendorsByDistributor = useSalesStore(
    (s) => s.fetchVendorsByDistributor,
  );
  const currentVendors = useSalesStore((s) => s.currentVendors);

  const [loading, setLoading] = useState(false);

  // Consolidate Form State to avoid "Cascading Renders"
  const [formData, setFormData] = useState({
    date: "",
    distributeurId: "",
    vendeurId: "",
    status: "",
    items: [] as any[],
  });

  const isFormInvalid = useMemo(() => {
    return (
      !formData.distributeurId ||
      !formData.vendeurId ||
      formData.items.length === 0 ||
      formData.items.some((i) => !i.product_id)
    );
  }, [formData]);

  useEffect(() => {
    if (open && sale) {
      fetchDependencies();
      if (sale.distributeur_id) fetchVendorsByDistributor(sale.distributeur_id);

      setFormData({
        date: sale.date.split("T")[0],
        distributeurId: sale.distributeur_id.toString(),
        vendeurId: sale.vendeur_id.toString(),
        status: sale.status, // Match new type
        items: (sale.products || []).map((p: any) => ({
          product_id: p.product_id.toString(),
          quantity: p.quantity,
        })),
      });
    }
  }, [open, sale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      date: formData.date,
      status: formData.status, // English
      distributorId: parseInt(formData.distributeurId), // English
      vendorId: parseInt(formData.vendeurId), // English
      products: formData.items.map((item) => ({
        // English
        product_id: parseInt(item.product_id),
        quantity: item.quantity,
      })),
    };

    const success = await updateSale(sale.id, payload);
    setLoading(false);
    if (success) onClose();
  };

  const handleDistributorChange = (val: string) => {
    setFormData((prev) => ({ ...prev, distributeurId: val, vendeurId: "" }));
    if (val) fetchVendorsByDistributor(parseInt(val));
  };

  const handleAddItem = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: 1 }],
    }));
  }, []);

  const handleRemoveItem = useCallback((idx: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  }, []);

  const handleProductChange = useCallback(
    (index: number, val: string) => {
      const p = products.find((prod: any) => prod.id.toString() === val);
      setFormData((prev) => {
        const newItems = [...prev.items];
        newItems[index] = {
          ...newItems[index],
          product_id: val,
        };
        return { ...prev, items: newItems };
      });
    },
    [products],
  );

  const handleQuantityChange = useCallback((index: number, val: string) => {
    const qty = parseInt(val) || 0;
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], quantity: qty };
      return { ...prev, items: newItems };
    });
  }, []);

  const statusStyles: Record<string, string> = {
    en_cours: "bg-amber-50 text-amber-700 border-amber-200",
    complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
    annulee: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="p-5 border-b bg-white">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Edit className="w-5 h-5 text-amir-blue" /> Modifier Vente #
            {sale?.id}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden bg-zinc-50/50"
        >
          <div className="p-5 space-y-5 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-zinc-200">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-500 uppercase">
                  Date
                </Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-500 uppercase">
                  Distributeur
                </Label>
                <Select
                  value={formData.distributeurId}
                  onValueChange={handleDistributorChange}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>

                  <SelectContent className="w-full">
                    {distributors.map((d: any) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-500 uppercase">
                  Vendeur
                </Label>
                <Select
                  value={formData.vendeurId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, vendeurId: v })
                  }
                  disabled={!formData.distributeurId}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>

                  <SelectContent className="w-full">
                    {currentVendors.map((v) => (
                      <SelectItem key={v.id} value={v.id.toString()}>
                        {v.nom} {v.prenom}{" "}
                        {!v.active && (
                          <Badge className="bg-gray-300">Inactif</Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-500 uppercase">
                  Statut
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger
                    className={`h-9 w-full border ${statusStyles[formData.status] ?? "bg-zinc-50"}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_cours">🟡 En cours</SelectItem>
                    <SelectItem value="complete">🟢 Validée</SelectItem>
                    <SelectItem value="annulee">🔴 Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden flex flex-col">
              <div className="bg-zinc-50/50 px-4 py-2 border-b flex justify-between items-center">
                <span className="font-medium text-sm">Produits</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-7 text-amir-blue"
                >
                  + Ajouter
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-[70%] pl-4">
                      Produit
                    </TableHead>
                    <TableHead className="text-xs text-center">Qté</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <SaleRow
                      key={index}
                      index={index}
                      item={item}
                      products={products}
                      onProductChange={handleProductChange}
                      onQtyChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                      isRemovable={formData.items.length > 1} // CHECK HERE
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="bg-white p-4 border-t flex items-center justify-between">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading || isFormInvalid} // PREVENT SUBMISSION
                className="bg-amir-blue"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Sauvegarder"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
