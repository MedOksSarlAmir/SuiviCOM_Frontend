"use client";
import React, { useState, useEffect } from "react";
import { useAdminDistributorStore } from "@/stores/admin/DistributorStore";
import { useGeographyStore } from "@/stores/admin/GeographyStore";
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
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store, Loader2, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function DistributorModal({ distributor, open, onClose }: any) {
  const { wilayas } = useGeographyStore();
  const { createDistributor, updateDistributor, supervisors } =
    useAdminDistributorStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    wilaya_id: "",
    supervisor_ids: [] as number[], // Changed to array
    address: "",
    active: true,
  });

  useEffect(() => {
    if (open) {
      if (distributor) {
        setForm({
          name: distributor.name || "",
          wilaya_id: distributor.wilaya_id?.toString() || "",
          // Map the objects returned from backend to IDs
          supervisor_ids: distributor.supervisors?.map((s: any) => s.id) || [],
          address: distributor.address || "",
          active: distributor.active ?? true,
        });
      } else {
        setForm({
          name: "",
          wilaya_id: "",
          supervisor_ids: [],
          address: "",
          active: true,
        });
      }
    }
  }, [open, distributor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      wilaya_id: parseInt(form.wilaya_id),
      // supervisor_ids is already an array of numbers
    };

    const success = distributor
      ? await updateDistributor(distributor.id, payload)
      : await createDistributor(payload);

    if (success) onClose();
    setLoading(false);
  };

  const toggleSupervisor = (id: number) => {
    setForm((prev) => ({
      ...prev,
      supervisor_ids: prev.supervisor_ids.includes(id)
        ? prev.supervisor_ids.filter((sid) => sid !== id)
        : [...prev.supervisor_ids, id],
    }));
  };

  // Filter supervisors belonging to the same zone as the selected Wilaya
  const filteredSupervisors = supervisors.filter((s) => {
    const selectedWilaya = wilayas.find(
      (w) => w.id.toString() === form.wilaya_id,
    );
    return !form.wilaya_id || s.zone_id === selectedWilaya?.zone_id;
  });

  const formInvalid =
    !form.name || !form.wilaya_id || form.supervisor_ids.length === 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-5 border-b bg-gray-50">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Store className="w-5 h-5 text-amir-blue" />
            {distributor ? "ÉDITER PARTENAIRE" : "NOUVEAU DISTRIBUTEUR"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden bg-zinc-50/50"
        >
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Identification */}
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
                  className="h-11 font-bold"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-[11px] font-black uppercase text-zinc-400">
                    Adresse
                  </Label>
                  <Input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </div>
                <div className="w-32 space-y-1.5">
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
                        "font-bold",
                        form.active ? "text-emerald-600" : "text-red-500",
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
            </div>

            {/* Geography & Multi-Supervisors */}
            <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-4">
              <h4 className="text-[10px] font-black text-amir-blue uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Rattachement & Management
              </h4>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-black uppercase text-zinc-400">
                    Wilaya de Siège *
                  </Label>
                  <Select
                    value={form.wilaya_id}
                    onValueChange={(v) =>
                      setForm({ ...form, wilaya_id: v, supervisor_ids: [] })
                    }
                  >
                    <SelectTrigger className="h-11 font-bold">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {wilayas.map((w) => (
                        <SelectItem key={w.id} value={w.id.toString()}>
                          {w.code} - {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Supervisor Selection (Multi-select) */}
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase text-amir-blue flex items-center gap-2">
                    <Users className="w-3 h-3" /> Superviseurs Assignés *
                  </Label>
                  <div className="border border-zinc-200 rounded-xl bg-zinc-50/50 p-3 max-h-48 overflow-y-auto space-y-2">
                    {filteredSupervisors.length > 0 ? (
                      filteredSupervisors.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-zinc-100 shadow-sm"
                        >
                          <Checkbox
                            id={`sup-${s.id}`}
                            checked={form.supervisor_ids.includes(s.id)}
                            onCheckedChange={() => toggleSupervisor(s.id)}
                          />
                          <label
                            htmlFor={`sup-${s.id}`}
                            className="text-sm font-bold text-zinc-700 cursor-pointer flex-1"
                          >
                            {s.last_name} {s.first_name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-zinc-400 italic text-center py-4">
                        {form.wilaya_id
                          ? "Aucun superviseur trouvé dans cette zone."
                          : "Sélectionnez une wilaya d'abord."}
                      </p>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Vous pouvez assigner plusieurs superviseurs à ce
                    distributeur.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-white p-5 border-t flex justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className={cn(
                "min-w-[160px] h-11 font-bold",
                formInvalid ? "bg-amber-400" : "bg-amir-blue",
              )}
              disabled={loading || formInvalid}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
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
