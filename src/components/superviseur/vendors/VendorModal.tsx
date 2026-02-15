"use client";
import React, { useState, useEffect } from "react";
import { useVendorStore } from "@/stores/supervisor/VendorStore";
import { useSalesStore } from "@/stores/supervisor/SaleStore";
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
import { UserPlus, UserCog, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorModalProps {
  vendor: any | null;
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

  const isMissing = (v: string) => !v || v.trim() === "";

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

  const formInvalid =
    isMissing(form.code) ||
    isMissing(form.nom) ||
    isMissing(form.prenom) ||
    isMissing(form.distributor_id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-5 border-b bg-gray-50">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isEdit ? (
              <UserCog className="w-5 h-5 text-amir-blue" />
            ) : (
              <UserPlus className="w-5 h-5 text-amir-blue" />
            )}
            {isEdit ? `Modifier ${vendor?.nom}` : "Nouveau Vendeur"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden bg-zinc-50/50"
        >
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Basic Info */}
            <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Code */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase text-zinc-400">
                  Code Vendeur
                </Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className={cn(
                    isMissing(form.code)
                      ? "border-amber-400 bg-amber-50 ring-1 ring-amber-200"
                      : "",
                  )}
                />
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase text-zinc-400">
                  Type
                </Label>
                <Select
                  value={form.vendor_type}
                  onValueChange={(v) => setForm({ ...form, vendor_type: v })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detail">Détail</SelectItem>
                    <SelectItem value="gros">Gros</SelectItem>
                    <SelectItem value="superette">Superette</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nom */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase text-zinc-400">
                  Nom
                </Label>
                <Input
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className={cn(
                    isMissing(form.nom)
                      ? "border-amber-400 bg-amber-50 ring-1 ring-amber-200"
                      : "",
                  )}
                />
              </div>

              {/* Prénom */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase text-zinc-400">
                  Prénom
                </Label>
                <Input
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  className={cn(
                    isMissing(form.prenom)
                      ? "border-amber-400 bg-amber-50 ring-1 ring-amber-200"
                      : "",
                  )}
                />
              </div>
            </div>
            {/* Distributor Section */}
            <div className="flex justify-center">
              <div className="w-full sm:w-3/4 p-4 bg-white rounded-xl border border-zinc-200 shadow-sm">
                <Label className="text-[11px] font-black uppercase text-zinc-400">
                  Distributeur
                </Label>
                <Select
                  value={form.distributor_id}
                  onValueChange={(v) => setForm({ ...form, distributor_id: v })}
                >
                  <SelectTrigger
                    className={cn(
                      "h-10 mt-1 w-full",
                      isMissing(form.distributor_id)
                        ? "border-amber-400 bg-amber-50 ring-1 ring-amber-200"
                        : "",
                    )}
                  >
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
            </div>
            {/* Status Section (edit only) */}
            {isEdit && (
              <div className="flex justify-center">
                <div className="w-full sm:w-3/4 p-4 bg-white rounded-xl border border-zinc-200 shadow-sm">
                  <Label className="text-[11px] font-black uppercase text-zinc-400">
                    Statut
                  </Label>
                  <Select
                    value={form.active ? "true" : "false"}
                    onValueChange={(v) =>
                      setForm({ ...form, active: v === "true" })
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "h-10 mt-1 w-full",
                        form.active
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-red-400 bg-red-50",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Actif</SelectItem>
                      <SelectItem value="false">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="bg-white p-5 border-t flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className={cn(
                "min-w-[160px] font-bold h-11",
                formInvalid
                  ? "bg-amber-400 hover:bg-amber-500 text-white"
                  : "bg-amir-blue hover:bg-amir-blue-hover text-white",
              )}
              disabled={loading || formInvalid}
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
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
