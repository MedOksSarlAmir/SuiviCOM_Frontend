"use client";
import React, { useState, useEffect } from "react";
import { useAdminDistributorStore } from "@/stores/AdminDistributorStore";
import { useGeographyStore } from "@/stores/GeographyStore";
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
import { Loader2, Store } from "lucide-react";

export function DistributorModal({ distributor, open, onClose }: any) {
  const { createDistributor, updateDistributor } = useAdminDistributorStore();
  const { wilayas, fetchGeography } = useGeographyStore();
  const [loading, setLoading] = useState(false);
  const isEdit = !!distributor;

  const [form, setForm] = useState({
    nom: "", // UI internal name
    wilaya_id: "",
  });

  useEffect(() => {
    if (open) {
      fetchGeography();
      if (distributor) {
        setForm({
          // Map backend 'name' back to UI 'nom' if needed for consistency
          nom: distributor.name || distributor.nom || "",
          wilaya_id: distributor.wilaya_id?.toString() || "",
        });
      } else {
        setForm({ nom: "", wilaya_id: "" });
      }
    }
  }, [open, distributor, fetchGeography]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Payload mapping happens in the Store (see Step 3 above)
    const success = isEdit
      ? await updateDistributor(distributor.id, form)
      : await createDistributor(form);

    if (success) onClose();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amir-blue" />
            {isEdit ? `Modifier ${form.nom}` : "Nouveau Distributeur"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nom du Distributeur</Label>
            <Input
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="ex: EURL LOGISTIQUE OUEST"
            />
          </div>
          <div className="space-y-2">
            <Label>Wilaya de Rattachement</Label>
            <Select
              value={form.wilaya_id}
              onValueChange={(v) => setForm({ ...form, wilaya_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {wilayas.map((w) => (
                  <SelectItem key={w.id} value={w.id.toString()}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="ghost" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-amir-blue"
              disabled={loading || !form.wilaya_id || !form.nom}
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
