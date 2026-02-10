"use client";
import React, { useState, useEffect } from "react";
import { useVendorStore } from "@/stores/VendorStore";
import { useSalesStore } from "@/stores/SaleStore";
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
import { UserPlus, UserCog, Loader2, CloudCog } from "lucide-react";

interface VendorModalProps {
  vendor: any | null; // If null, we are in "Create" mode
  open: boolean;
  onClose: () => void;
}

const INITIAL_FORM = {
  code: "",
  nom: "",
  prenom: "",
  vendor_type: "detail",
  distributor_id: "",
  active: true,
};

export function VendorModal({ vendor, open, onClose }: VendorModalProps) {
  const { createVendor, updateVendor } = useVendorStore();
  const { distributors, fetchDependencies } = useSalesStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const isEdit = !!vendor;
  useEffect(() => {
    if (open) {
      fetchDependencies();
      if (vendor) {
        setForm({
          ...vendor,
          distributor_id: vendor.distributor_id?.toString() || "",
        });
      } else {
        setForm(INITIAL_FORM);
      }
    }
  }, [open, vendor, fetchDependencies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      distributor_id: parseInt(form.distributor_id),
    };

    const success = isEdit
      ? await updateVendor(vendor.id, payload)
      : await createVendor(payload);

    setLoading(false);
    if (success) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? (
              <UserCog className="text-amir-blue" />
            ) : (
              <UserPlus className="text-amir-blue" />
            )}
            {isEdit ? `Modifier ${vendor?.nom}` : "Nouveau Vendeur"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Code Vendeur</Label>
              <Input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.vendor_type}
                onValueChange={(v) => setForm({ ...form, vendor_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detail">Détail</SelectItem>
                  <SelectItem value="gros">Gros</SelectItem>
                  <SelectItem value="superette">Superette</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                required
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Prénom</Label>
              <Input
                required
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Distributeur</Label>
            <Select
              value={form.distributor_id}
              onValueChange={(v) => setForm({ ...form, distributor_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir..." />
              </SelectTrigger>
              <SelectContent>
                {distributors.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEdit && (
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={form.active ? "true" : "false"}
                onValueChange={(v) =>
                  setForm({ ...form, active: v === "true" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Actif</SelectItem>
                  <SelectItem value="false">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button variant="ghost" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-amir-blue"
              disabled={loading || !form.distributor_id}
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : isEdit ? (
                "Mettre à jour"
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
