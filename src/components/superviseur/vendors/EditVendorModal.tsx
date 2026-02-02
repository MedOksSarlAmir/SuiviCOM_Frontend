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
import { UserCog, Loader2 } from "lucide-react";

interface EditVendorModalProps {
  vendor: any;
  onClose: () => void;
}

export function EditVendorModal({ vendor, onClose }: EditVendorModalProps) {
  const { updateVendor } = useVendorStore();

  const { distributors, fetchDependencies } = useSalesStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(() => ({
    code: vendor?.code || "",
    nom: vendor?.nom || "",
    prenom: vendor?.prenom || "",
    vendor_type: vendor?.vendor_type || "detail",
    distributor_id: vendor?.distributor_id?.toString() || "",
    active: vendor?.active ?? true,
  }));

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await updateVendor(vendor.id, {
      ...form,
      distributor_id: parseInt(form.distributor_id),
    });

    setLoading(false);
    if (success) onClose();
  };

  return (
    <Dialog open={!!vendor} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-amir-blue" />
            Modifier Vendeur : {vendor?.nom}
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
                <SelectValue />
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

          <div className="space-y-2">
            <Label>Statut du compte</Label>
            <Select
              value={form.active ? "true" : "false"}
              onValueChange={(v) => setForm({ ...form, active: v === "true" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Compte Actif</SelectItem>
                <SelectItem value="false">Compte Inactif</SelectItem>
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
              disabled={loading || !form.distributor_id}
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Mettre à jour"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
