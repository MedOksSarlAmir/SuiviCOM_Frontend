"use client";
import React, { useState, useEffect } from "react";
import { useAdminDistributorStore } from "@/stores/admin/DistributorStore";
import { useGeographyStore } from "@/stores/admin/GeographyStore";
import { useAdminUserStore } from "@/stores/admin/UserStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Store, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function DistributorModal({ distributor, open, onClose }: any) {
  const { wilayas } = useGeographyStore();
  const { createDistributor, updateDistributor, supervisors } =
    useAdminDistributorStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: distributor ? distributor.name || "" : "",
    wilaya_id: distributor ? distributor.wilaya_id?.toString() || "" : "",
    supervisor_id: distributor
      ? distributor.supervisor_id?.toString() || ""
      : "",
    address: distributor ? distributor.address || "" : "",
    active: distributor ? distributor.active || true : true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      wilaya_id: parseInt(form.wilaya_id),
      supervisor_id: form.supervisor_id ? parseInt(form.supervisor_id) : null,
    };

    const success = distributor
      ? await updateDistributor(distributor.id, payload)
      : await createDistributor(payload);

    if (success) onClose();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 border-b bg-gray-50">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Store className="w-5 h-5 text-amir-blue" />
            {distributor ? "ÉDITER PARTENAIRE" : "NOUVEAU DISTRIBUTEUR"}
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden bg-zinc-50/50"
        >
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Identification Card */}
            <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                <Store className="w-3 h-3" /> Identification
              </h4>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase text-zinc-400">
                  Nom / Enseigne *
                </Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: EURL LOGISTIQUE..."
                  className={
                    !form.name
                      ? "border-amber-400 bg-amber-50 h-11 font-bold"
                      : "h-11 font-bold"
                  }
                />
              </div>

              <div className="flex gap-4">
                <div className="w-full space-y-1.5">
                  <Label className="text-[11px] font-black uppercase text-zinc-400">
                    Adresse{" "}
                    <span className="font-normal text-zinc-400">
                      (optionnel)
                    </span>
                  </Label>
                  <Input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className="h-10"
                    placeholder="Ex : 12 Rue Didouche Mourad, Alger..."
                  />
                </div>

                <div className="w-fit space-y-1.5">
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
                        "h-10 font-bold",
                        form.active
                          ? "text-emerald-600 border-emerald-100 bg-emerald-50/30"
                          : "text-red-500 border-red-100 bg-red-50/30",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="true">Actif</SelectItem>
                      <SelectItem value="false">Inactif / Bloqué</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Geography & Management Card */}
            <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black text-amir-blue uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Rattachement & Management
              </h4>

              <div className="space-y-4">
                {/* Wilaya */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-black uppercase text-zinc-400">
                    Wilaya de Siège *
                  </Label>
                  <Select
                    value={form.wilaya_id}
                    onValueChange={(v) =>
                      setForm({ ...form, wilaya_id: v, supervisor_id: "" })
                    }
                  >
                    <SelectTrigger className="h-11 font-bold border border-zinc-300 bg-white">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      {wilayas.map((w) => (
                        <SelectItem
                          key={w.id}
                          value={w.id.toString()}
                          className="font-medium"
                        >
                          {w.code} - {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Supervisor */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-black uppercase text-amir-blue">
                    Superviseur Assigné *
                  </Label>
                  <Select
                    value={form.supervisor_id}
                    onValueChange={(v) =>
                      setForm({ ...form, supervisor_id: v })
                    }
                    disabled={!form.wilaya_id}
                  >
                    <SelectTrigger className="h-11 font-bold border border-zinc-300 bg-white">
                      <SelectValue placeholder="Choisir un superviseur..." />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      {supervisors
                        .filter(
                          (s) =>
                            s.zone_id ==
                            wilayas.find((w) => w.id == form.wilaya_id)
                              ?.zone_id,
                        )
                        .map((s) => (
                          <SelectItem
                            key={s.id}
                            value={s.id.toString()}
                            className="font-bold"
                          >
                            {s.last_name} {s.first_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-zinc-400 italic px-1">
                    Seuls les superviseurs sont listés ici.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="bg-white p-5 border-t flex justify-end gap-3">
            <Button
              variant="ghost"
              type="button"
              onClick={onClose}
              className="font-bold text-zinc-400"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className={cn(
                "min-w-[160px] h-11 font-bold",
                !form.name || !form.wilaya_id || !form.supervisor_id
                  ? "bg-amber-400 hover:bg-amber-500 text-white"
                  : "bg-amir-blue hover:bg-amir-blue-hover text-white",
              )}
              disabled={
                loading || !form.name || !form.wilaya_id || !form.supervisor_id
              }
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : distributor ? (
                "APPLIQUER"
              ) : (
                "VALIDER CRÉATION"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
