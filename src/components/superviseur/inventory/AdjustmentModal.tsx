// src/components/superviseur/inventory/AdjustmentModal.tsx
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
import { Loader2, Scale, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdjustmentModal({
  product,
  distributorId,
  open,
  onClose,
}: any) {
  const [loading, setLoading] = useState(false);
  const [val, setVal] = useState("");
  const [note, setNote] = useState("");
  const createAdjustment = useInventoryStore((s) => s.createAdjustment);

  const theoretical = product?.theoretical_qty || 0;
  const physical = product?.physical_qty || 0;
  const delta = parseInt(val) || 0;
  const finalLogical = theoretical + delta;

  const handleAutoFix = () => {
    // Math to make Theoretical = Physical
    setVal((physical - theoretical).toString());
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await createAdjustment({
      date: new Date().toISOString(),
      distributor_id: parseInt(distributorId),
      product_id: product.product_id,
      quantity: delta,
      note: note,
    });
    setLoading(false);
    if (success) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="text-amber-500 w-5 h-5" /> Régularisation de Stock
          </DialogTitle>
          <div className="bg-zinc-50 p-2 border rounded mt-2 text-xs font-bold text-zinc-700">
            {product?.product_name}{" "}
            <span className="text-zinc-400 font-mono ml-2">
              ({product?.product_code})
            </span>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 pt-2">
          {/* Comparison Grid */}
          <div className="grid grid-cols-4 gap-2 p-4 bg-zinc-900 text-white rounded-xl text-center border-b-4 border-amber-500 shadow-inner">
            <div>
              <p className="text-[9px] text-zinc-400 uppercase font-bold mb-1">
                Théorique
              </p>
              <p className="text-lg font-mono">{theoretical}</p>
            </div>
            <div className="border-l border-zinc-700">
              <p className="text-[9px] text-amber-400 uppercase font-bold mb-1">
                Physique
              </p>
              <p className="text-lg font-mono font-bold text-amber-400">
                {physical}
              </p>
            </div>
            <div className="border-l border-zinc-700 bg-zinc-800">
              <p className="text-[9px] text-zinc-400 uppercase font-bold mb-1">
                Correction
              </p>
              <p
                className={cn(
                  "text-lg font-mono font-bold",
                  delta >= 0 ? "text-emerald-400" : "text-red-400",
                )}
              >
                {delta > 0 ? `+${delta}` : delta}
              </p>
            </div>
            <div className="border-l border-zinc-700">
              <p className="text-[9px] text-zinc-400 uppercase font-bold mb-1">
                Futur Logique
              </p>
              <p className="text-lg font-mono font-bold text-white">
                {finalLogical}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label>Valeur de l&apos;ajustement (+/-)</Label>
                <Input
                  type="number"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-10 border-amber-500 text-amber-600 hover:bg-amber-50 gap-2 font-bold"
                onClick={handleAutoFix}
              >
                <Calculator className="w-4 h-4" /> Aligner sur Physique
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label>Justification (Min. 3 caractères)</Label>
              <Input
                placeholder="Ex: Vol, Casse, Inventaire..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
              />
              {note.length > 0 && note.length < 3 && (
                <p className="text-[10px] text-red-500 font-bold">
                  La justification est trop courte.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full bg-amir-blue h-11 font-bold text-white"
              disabled={loading || delta === 0 || note.length < 3}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Appliquer la régularisation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
