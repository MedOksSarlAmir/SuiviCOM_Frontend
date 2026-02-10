"use client";
import React, { useState, useEffect } from "react";
import { useAdminProductStore } from "@/stores/AdminProductStore";
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
import { Package, Loader2, Banknote, Tag } from "lucide-react";

interface ProductModalProps {
  product: any | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { metadata, createProduct, updateProduct } = useAdminProductStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: product?.code || "",
    name: product?.name || "",
    format: product?.format || "",
    category_id: product?.category_id?.toString() || "",
    type_id: product?.type_id?.toString() || "",
    price_factory: product?.price_factory || 0,
    price_gros: product?.price_gros || 0,
    price_detail: product?.price_detail || 0,
    price_superette: product?.price_superette || 0,
    active: product?.active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      category_id: parseInt(form.category_id),
      type_id: parseInt(form.type_id),
      price_factory: parseFloat(form.price_factory.toString()),
      price_gros: parseFloat(form.price_gros.toString()),
      price_detail: parseFloat(form.price_detail.toString()),
      price_superette: parseFloat(form.price_superette.toString()),
    };

    const success = product
      ? await updateProduct(product.id, payload)
      : await createProduct(payload);

    if (success) onClose();
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5 text-amir-blue" />
            {product ? `Modifier ${product.name}` : "Nouveau Produit"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Identification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code Article</Label>
                <Input
                  required
                  disabled={!!product}
                  placeholder="ex: COL1L"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Input
                  placeholder="ex: 1L, 33cl..."
                  value={form.format}
                  onChange={(e) => setForm({ ...form, format: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Désignation complète</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Famille (Catégorie)</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm({ ...form, category_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {metadata.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type de Produit</Label>
              <Select
                value={form.type_id}
                onValueChange={(v) => setForm({ ...form, type_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {metadata.types.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Banknote className="w-4 h-4" /> Tarification (DA)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-50 p-4 rounded-lg border border-dashed">
              {[
                { label: "Usine", key: "price_factory" },
                { label: "Gros", key: "price_gros" },
                { label: "Détail", key: "price_detail" },
                { label: "Supérette", key: "price_superette" },
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold">
                    {item.label}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(form as any)[item.key]}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                      setForm({ ...form, [item.key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label>Statut :</Label>
            <Select
              value={form.active ? "true" : "false"}
              onValueChange={(v) => setForm({ ...form, active: v === "true" })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Actif</SelectItem>
                <SelectItem value="false">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>

        <DialogFooter className="border-t pt-4">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-amir-blue min-w-[120px]"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              "Enregistrer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
