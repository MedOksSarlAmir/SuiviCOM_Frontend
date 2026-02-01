"use client";
import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { usePurchaseStore, Purchase } from "@/stores/PurchaseStore";
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
import { Trash2, Edit, Loader2, ShoppingBag } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

// Memoized Row to prevent UI lag
const PurchaseRowItem = memo(
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
        <TableCell className="py-2 text-sm text-zinc-500">
          {item.unit_price} DA
        </TableCell>
        <TableCell className="py-2">
          <Input
            type="number"
            className="h-8 w-20"
            value={item.quantity}
            onChange={(e) => onQtyChange(index, e.target.value)}
          />
        </TableCell>
        <TableCell className="text-right pr-4 py-2 font-medium">
          {(item.quantity * item.unit_price).toLocaleString()}
        </TableCell>
        <TableCell className="py-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500"
            onClick={() => onRemove(index)}
            disabled={!isRemovable}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </TableCell>
      </TableRow>
    );
  },
);
PurchaseRowItem.displayName = "PurchaseRowItem";

interface EditPurchaseModalProps {
  purchase: Purchase;
  open: boolean;
  onClose: () => void;
}

export function EditPurchaseModal({
  purchase,
  open,
  onClose,
}: EditPurchaseModalProps) {
  const products = usePurchaseStore((s) => s.products);
  const distributors = usePurchaseStore((s) => s.distributors);
  const updatePurchase = usePurchaseStore((s) => s.updatePurchase);
  const fetchDependencies = usePurchaseStore((s) => s.fetchDependencies);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    distributeurId: "",
    status: "",
    items: [] as any[],
  });

  // Load data when modal opens
  useEffect(() => {
    if (open && purchase) {
      fetchDependencies();
      setFormData({
        date: purchase.date ? purchase.date.split("T")[0] : "",
        distributeurId: purchase.distributeur_id.toString(),
        status: purchase.status,
        items: (purchase.products || []).map((p: any) => ({
          product_id: p.product_id.toString(),
          quantity: p.quantity,
          unit_price: p.unit_price,
        })),
      });
    }
  }, [open, purchase, fetchDependencies]);

  const calculateTotal = formData.items.reduce(
    (acc, item) => acc + item.quantity * item.unit_price,
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      date: formData.date,
      status: formData.status,
      distributorId: parseInt(formData.distributeurId),
      products: formData.items.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };

    const success = await updatePurchase(purchase.id, payload);
    setLoading(false);
    if (success) onClose();
  };

  const handleProductChange = useCallback(
    (index: number, val: string) => {
      const p = products.find((prod: any) => prod.id.toString() === val);
      setFormData((prev) => {
        const newItems = [...prev.items];
        newItems[index] = {
          ...newItems[index],
          product_id: val,
          unit_price: p ? p.price : 0,
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

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: 1, unit_price: 0 }],
    }));
  };

  const statusStyles: Record<string, string> = {
    en_cours: "bg-amber-50 text-amber-700 border-amber-200",
    complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
    annulee: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-5 border-b bg-white">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Edit className="w-5 h-5 text-amir-blue" /> Modifier
            Approvisionnement #{purchase?.id}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden bg-zinc-50/50"
        >
          <div className="p-5 space-y-5 overflow-y-auto">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-zinc-200 shadow-sm">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-500 uppercase">
                  Date
                </Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-500 uppercase">
                  Distributeur
                </Label>
                <Select
                  value={formData.distributeurId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, distributeurId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {distributors.map((d: any) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-500 uppercase">
                  Statut
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger
                    className={`border ${statusStyles[formData.status]}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_cours">🟡 En cours</SelectItem>
                    <SelectItem value="complete">🟢 Validé</SelectItem>
                    <SelectItem value="annulee">🔴 Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white border rounded-lg overflow-hidden flex flex-col shadow-sm">
              <div className="bg-zinc-50/50 px-4 py-2 border-b flex justify-between items-center">
                <span className="font-bold text-sm text-zinc-600">
                  Lignes de commande
                </span>
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
                    <TableHead className="text-xs pl-4">Produit</TableHead>
                    <TableHead className="text-xs">Prix</TableHead>
                    <TableHead className="text-xs">Qté</TableHead>
                    <TableHead className="text-xs text-right pr-4">
                      Total
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <PurchaseRowItem
                      key={index}
                      index={index}
                      item={item}
                      products={products}
                      onProductChange={handleProductChange}
                      onQtyChange={handleQuantityChange}
                      onRemove={(idx: number) =>
                        setFormData((prev) => ({
                          ...prev,
                          items: prev.items.filter((_, i) => i !== idx),
                        }))
                      }
                      isRemovable={formData.items.length > 1}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="bg-white p-4 border-t flex items-center justify-between">
            <div className="text-2xl font-bold text-amir-blue">
              {calculateTotal.toLocaleString()}{" "}
              <span className="text-sm font-normal text-zinc-400">DA</span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  !formData.distributeurId ||
                  formData.items.some((i) => !i.product_id)
                }
                className="bg-amir-blue"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
