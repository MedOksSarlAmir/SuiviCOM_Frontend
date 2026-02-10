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
import { Loader2, Scale, ArrowRight } from "lucide-react";
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

  const delta = parseInt(val) || 0;
  const final = (product?.stock || 0) + delta;

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="text-amber-500 w-5 h-5" /> Correction de stock
          </DialogTitle>
          <div className="bg-zinc-50 p-2 border rounded mt-2 text-xs font-medium">
            {product?.name}{" "}
            <span className="text-zinc-400 font-mono ml-2">
              ({product?.code})
            </span>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 pt-2">
          <div className="flex items-center justify-around p-4 bg-zinc-900 text-white rounded-lg">
            <div className="text-center">
              <p className="text-[10px] text-zinc-400 uppercase">Actuel</p>
              <p className="text-xl font-mono">{product?.stock}</p>
            </div>
            <ArrowRight className="text-zinc-600" />
            <div className="text-center">
              <p className="text-[10px] text-zinc-400 uppercase">Delta</p>
              <p
                className={cn(
                  "text-xl font-mono font-bold",
                  delta > 0 ? "text-emerald-400" : "text-red-400",
                )}
              >
                {delta > 0 ? `+${delta}` : delta}
              </p>
            </div>
            <ArrowRight className="text-zinc-600" />
            <div className="text-center">
              <p className="text-[10px] text-zinc-400 uppercase">Final</p>
              <p className="text-xl font-mono font-bold text-amber-400">
                {final}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Valeur (+/-)</Label>
              <Input
                type="number"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Justification</Label>
              <Input
                placeholder="Ex: Casse, Erreur saisie..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                minLength={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full bg-amir-blue"
              disabled={loading || delta === 0 || note.length < 5}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Appliquer la correction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
