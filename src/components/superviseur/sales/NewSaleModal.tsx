"use client";
import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useSalesStore } from "@/stores/SaleStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import { Plus, Trash2, ShoppingCart, Loader2, Calculator } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// --- 1. MEMOIZED ROW COMPONENT ---
const NewSaleRow = memo(
  ({
    index,
    item,
    productOptions,
    onProductChange,
    onQtyChange,
    onRemove,
    isRemovable,
    vendorType,
  }: any) => {
    const products = useSalesStore((s) => s.products);
    const [localQty, setLocalQty] = useState(item.quantity);

    useEffect(() => {
      setLocalQty(item.quantity);
    }, [item.quantity]);

    // Calculate active price based on vendor type
    const product = products.find(
      (p: any) => p.id.toString() === item.product_id,
    );
    let unitPrice = 0;
    if (product) {
      if (vendorType === "gros") unitPrice = product.price_gros;
      else if (vendorType === "superette") unitPrice = product.price_superette;
      else unitPrice = product.price_detail;
    }

    return (
      <TableRow className="hover:bg-zinc-50 border-b-zinc-50">
        <TableCell className="pl-4 py-2">
          <Select
            value={item.product_id}
            onValueChange={(val) => onProductChange(index, val)}
          >
            <SelectTrigger className="border-0 shadow-none hover:bg-zinc-100 h-8 px-2 -ml-2 w-full focus:ring-0">
              <SelectValue placeholder="Choisir..." />
            </SelectTrigger>
            <SelectContent className="max-h-[250px]">
              {productOptions}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="py-2 text-zinc-500 font-medium">
          {unitPrice > 0 ? `${unitPrice.toLocaleString()} DA` : "--"}
        </TableCell>
        <TableCell className="py-2">
          <Input
            type="number"
            min="1"
            value={localQty}
            onChange={(e) => setLocalQty(e.target.value)}
            onBlur={() => onQtyChange(index, localQty)}
            className="h-8 w-20 bg-white"
          />
        </TableCell>
        <TableCell className="py-2 text-right font-bold text-zinc-700 pr-4">
          {(unitPrice * localQty).toLocaleString()} DA
        </TableCell>
        <TableCell className="py-2 text-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="h-7 w-7 text-zinc-400 hover:text-red-600"
            disabled={!isRemovable}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </TableCell>
      </TableRow>
    );
  },
);
NewSaleRow.displayName = "NewSaleRow";

// --- 2. MAIN MODAL COMPONENT ---
export function NewSaleModal() {
  const products = useSalesStore((s) => s.products);
  const distributors = useSalesStore((s) => s.distributors);
  const currentVendors = useSalesStore((s) => s.currentVendors);
  const createSale = useSalesStore((s) => s.createSale);
  const fetchDependencies = useSalesStore((s) => s.fetchDependencies);
  const fetchVendorsByDistributor = useSalesStore(
    (s) => s.fetchVendorsByDistributor,
  );

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    distributeurId: "",
    vendeurId: "",
    date: new Date().toISOString().split("T")[0],
    status: "en_cours",
    items: [{ product_id: "", quantity: 1 }],
  });

  useEffect(() => {
    if (open) fetchDependencies();
  }, [open, fetchDependencies]);

  // Identify Vendor Type for pricing logic
  const selectedVendor = currentVendors.find(
    (v) => v.id.toString() === formData.vendeurId,
  );
  const vendorType = selectedVendor?.type || "detail";

  // Calculate Total Sale Amount
  const totalAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      const p = products.find(
        (prod: any) => prod.id.toString() === item.product_id,
      );
      if (!p) return sum;
      const price =
        vendorType === "gros"
          ? p.price_gros
          : vendorType === "superette"
            ? p.price_superette
            : p.price_detail;
      return sum + price * item.quantity;
    }, 0);
  }, [formData.items, products, vendorType]);

  const isFormInvalid = useMemo(() => {
    return (
      !formData.distributeurId ||
      !formData.vendeurId ||
      formData.items.length === 0 ||
      formData.items.some((i) => !i.product_id)
    );
  }, [formData]);

  const memoizedProductOptions = useMemo(() => {
    return products.map((p: any) => (
      <SelectItem key={p.id} value={p.id.toString()}>
        {p.code} - {p.designation}
      </SelectItem>
    ));
  }, [products]);

  const handleDistributorChange = useCallback(
    (val: string) => {
      setFormData((prev) => ({ ...prev, distributeurId: val, vendeurId: "" }));
      if (val) fetchVendorsByDistributor(parseInt(val));
    },
    [fetchVendorsByDistributor],
  );

  const handleProductChange = useCallback(
    (index: number, productIdStr: string) => {
      setFormData((prev) => {
        const newItems = [...prev.items];
        newItems[index] = { ...newItems[index], product_id: productIdStr };
        return { ...prev, items: newItems };
      });
    },
    [],
  );

  const handleQuantityChange = useCallback((index: number, val: string) => {
    const qty = parseInt(val) || 0;
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], quantity: qty };
      return { ...prev, items: newItems };
    });
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddItem = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: "", quantity: 1 }],
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid) return;

    setLoading(true);
    const payload = {
      date: formData.date,
      distributeurId: parseInt(formData.distributeurId), // Backend: distributeurId
      acteurId: parseInt(formData.vendeurId), // Backend: acteurId
      status: formData.status,
      products: formData.items.map((i) => ({
        product_id: parseInt(i.product_id),
        quantity: i.quantity,
      })),
    };

    const success = await createSale(payload);
    setLoading(false);
    if (success) {
      setOpen(false);
      setFormData({
        distributeurId: "",
        vendeurId: "",
        date: new Date().toISOString().split("T")[0],
        status: "en_cours",
        items: [{ product_id: "", quantity: 1 }],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amir-blue hover:bg-amir-blue-hover text-white h-9 px-4">
          <Plus className="w-4 h-4 mr-2" /> Nouvelle Vente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-5 border-b bg-white">
          <DialogTitle className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-amir-blue" /> Nouvelle Vente
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden bg-zinc-50/50"
        >
          <div className="p-5 space-y-5 overflow-y-auto">
            {/* Header Fields */}
            <div className="p-4 bg-white rounded-lg border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-sm">
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
                  className="h-9 w-full"
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
                  <SelectContent>
                    {distributors.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-500 uppercase">
                  Vendeur{" "}
                  {formData.vendeurId && (
                    <Badge className="ml-2 bg-zinc-100 text-zinc-600 text-[10px]">
                      {vendorType}
                    </Badge>
                  )}
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
                  <SelectContent>
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
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_cours">🟡 En cours</SelectItem>
                    <SelectItem value="complete">🟢 Validée</SelectItem>
                    <SelectItem value="annulee">🔴 Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-zinc-50/50 px-4 py-2 border-b flex justify-between items-center">
                <span className="font-medium text-sm">Lignes de vente</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-7 text-amir-blue"
                >
                  + Ajouter un produit
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%] pl-4 h-9 text-xs">
                      Désignation
                    </TableHead>
                    <TableHead className="h-9 text-xs">P.U</TableHead>
                    <TableHead className="h-9 text-xs">Qté</TableHead>
                    <TableHead className="h-9 text-xs text-right pr-4">
                      Total
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <NewSaleRow
                      key={index}
                      index={index}
                      item={item}
                      vendorType={vendorType}
                      productOptions={memoizedProductOptions}
                      onProductChange={handleProductChange}
                      onQtyChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                      isRemovable={formData.items.length > 1}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="bg-white p-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-amir-blue">
              <Calculator className="w-5 h-5" />
              <span className="text-2xl font-bold">
                {totalAmount.toLocaleString()} DA
              </span>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-amir-blue w-32"
                disabled={loading || isFormInvalid}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Valider"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
