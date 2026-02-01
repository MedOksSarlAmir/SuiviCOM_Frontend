"use client";
import React, { useState } from "react";
import { useInventoryStore } from "@/stores/InventoryStore";
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
import { Loader2, Scale, ArrowRight, Info } from "lucide-react";

export function AdjustmentModal({
  product,
  distributorId,
  open,
  onClose,
}: any) {
  const [loading, setLoading] = useState(false);
  const createAdjustment = useInventoryStore((s) => s.createAdjustment);

  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [note, setNote] = useState("");

  const initialStock = product?.stock || 0;
  const delta = parseInt(adjustmentValue) || 0;
  const finalStock = initialStock + delta;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (delta === 0) return;

    setLoading(true);
    const success = await createAdjustment({
      date: new Date().toISOString(),
      distributor_id: parseInt(distributorId),
      product_id: product.product_id,
      quantity: delta,
      note: note,
    });

    setLoading(false);
    if (success) {
      setAdjustmentValue("");
      setNote("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-t-4 border-t-amber-500">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Scale className="text-amber-500 w-6 h-6" />
            Correction d&apos;inventaire
          </DialogTitle>
          <div className="bg-zinc-50 p-3 rounded-md border mt-2">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-tight">
              Produit sélectionné
            </p>
            <p className="text-sm font-semibold text-amir-blue">
              {product?.designation}
            </p>
            <p className="text-[10px] text-zinc-400">Code: {product?.code}</p>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 pt-4">
          {/* Visualisation du changement */}
          <div className="flex items-center justify-between p-4 bg-zinc-900 text-white rounded-xl shadow-inner">
            <div className="text-center">
              <p className="text-[10px] text-zinc-400 uppercase font-bold">
                Actuel
              </p>
              <p className="text-2xl font-mono">{initialStock}</p>
            </div>

            <ArrowRight className="text-zinc-500" />

            <div className="text-center px-4 py-1 bg-zinc-800 rounded-lg border border-zinc-700">
              <p className="text-[10px] text-zinc-400 uppercase font-bold">
                Correction
              </p>
              <p
                className={`text-2xl font-mono font-bold ${delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-zinc-500"}`}
              >
                {delta > 0 ? `+${delta}` : delta}
              </p>
            </div>

            <ArrowRight className="text-zinc-500" />

            <div className="text-center">
              <p className="text-[10px] text-zinc-400 uppercase font-bold">
                Nouveau
              </p>
              <p className="text-2xl font-mono font-black text-amber-400">
                {finalStock}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold">
                Valeur de l&apos;ajustement
              </Label>
              <Input
                type="number"
                placeholder="Ex: 10 pour ajouter, -5 pour retirer"
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(e.target.value)}
                className="h-12 text-lg font-mono focus-visible:ring-amber-500"
                required
              />
              <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Utilisez un signe <b>moins (-)</b> pour diminuer le stock.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold">Justification (Note)</Label>
              <Input
                placeholder="Pourquoi cette correction ? (ex: Erreur saisie, casse...)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                minLength={5}
                className="bg-zinc-50"
              />
            </div>
          </div>

          <DialogFooter>
            <div className="flex flex-col w-full gap-2">
              <Button
                type="submit"
                className="w-full h-11 bg-amir-blue hover:bg-amir-blue-hover text-white font-bold"
                disabled={loading || delta === 0 || note.length < 5}
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  "Appliquer la correction"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-zinc-500 text-xs"
              >
                Annuler
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
