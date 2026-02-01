"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePurchaseStore } from "@/stores/PurchaseStore";
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
import { Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function NewPurchaseModal() {
  const { products, distributors, createPurchase, fetchDependencies } =
    usePurchaseStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    distributeurId: "",
    date: new Date().toISOString().split("T")[0],
    status: "en_cours",
    items: [{ product_id: "", quantity: 1, price: 0 }],
  });

  useEffect(() => {
    if (open) fetchDependencies();
  }, [open, fetchDependencies]);

  const calculateTotal = useMemo(() => {
    return formData.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0,
    );
  }, [formData.items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await createPurchase({
      date: formData.date,
      distributeurId: parseInt(formData.distributeurId),
      status: formData.status,
      products: formData.items.map((i) => ({
        product_id: parseInt(i.product_id),
        quantity: i.quantity,
      })),
    });
    setLoading(false);
    if (success) {
      setOpen(false);
      setFormData({
        distributeurId: "",
        date: new Date().toISOString().split("T")[0],
        status: "en_cours",
        items: [{ product_id: "", quantity: 1, price: 0 }],
      });
    }
  };

  const handleProductChange = (index: number, val: string) => {
    const p = products.find((prod: any) => prod.id.toString() === val);
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      product_id: val,
      price: p?.price || 0,
    };
    setFormData({ ...formData, items: newItems });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amir-blue hover:bg-amir-blue-hover text-white h-9">
          <Plus className="w-4 h-4 mr-2" /> Nouvel Achat
        </Button>
      </DialogTrigger>
      {/* sm:max-w-4xl and overflow-hidden are key here */}
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="p-5 border-b bg-white">
          <DialogTitle className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-amir-blue" /> Nouvel
            Approvisionnement
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden bg-zinc-50/50"
        >
          {/* overflow-y-auto allows the body to scroll while keeping header/footer sticky */}
          <div className="p-5 space-y-5 overflow-y-auto">
            <div className="p-4 bg-white rounded-lg border border-zinc-200 grid grid-cols-1 sm:grid-cols-4 gap-4 shadow-sm">
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

              {/* Spanning 2 columns to fill the visual gap since there is no vendor */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-zinc-500 uppercase">
                  Distributeur
                </Label>
                <Select
                  value={formData.distributeurId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, distributeurId: v })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Choisir le partenaire..." />
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
                  Statut
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_cours">🟡 En cours</SelectItem>
                    <SelectItem value="complete">🟢 Validée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-zinc-50/50 px-4 py-2 border-b flex justify-between items-center">
                <span className="font-medium text-sm">Produits commandés</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-amir-blue"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      items: [
                        ...formData.items,
                        { product_id: "", quantity: 1, price: 0 },
                      ],
                    })
                  }
                >
                  + Ajouter une ligne
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[45%] pl-4 text-xs">
                      Désignation
                    </TableHead>
                    <TableHead className="text-xs">Prix Unit.</TableHead>
                    <TableHead className="text-xs">Qté</TableHead>
                    <TableHead className="text-right pr-4 text-xs">
                      Total
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <TableRow key={index} className="hover:bg-zinc-50">
                      <TableCell className="pl-4 py-2">
                        <Select
                          value={item.product_id}
                          onValueChange={(v) => handleProductChange(index, v)}
                        >
                          <SelectTrigger className="border-0 shadow-none bg-transparent h-8">
                            <SelectValue placeholder="Choisir..." />
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
                      <TableCell className="py-2 text-zinc-500 text-sm">
                        {item.price} DA
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          className="h-8 w-20"
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].quantity =
                              parseInt(e.target.value) || 0;
                            setFormData({ ...formData, items: newItems });
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium pr-4 py-2">
                        {(item.quantity * item.price).toLocaleString()} DA
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          disabled={formData.items.length === 1}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              items: formData.items.filter(
                                (_, i) => i !== index,
                              ),
                            })
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="bg-white p-4 border-t flex items-center justify-between">
            <div className="text-2xl font-bold text-amir-blue">
              {calculateTotal.toLocaleString()} DZD
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
                disabled={
                  loading ||
                  !formData.distributeurId ||
                  formData.items.some((i) => !i.product_id)
                }
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
