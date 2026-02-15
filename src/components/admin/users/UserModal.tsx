"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAdminUserStore } from "@/stores/admin/UserStore";
import { useGeographyStore } from "@/stores/admin/GeographyStore";
import { useAdminDistributorStore } from "@/stores/admin/DistributorStore"; // Added this
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
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Loader2, MapPin, UserCog, Store } from "lucide-react";

export function UserModal({ user, open, onClose }: any) {
  const { regions, zones, wilayas, fetchGeography } = useGeographyStore();
  const { distributors, fetchDistributors } = useAdminDistributorStore();
  const { createUser, updateUser } = useAdminUserStore();
  const [loading, setLoading] = useState(false);

  let defaultForm = {
    username: "",
    password: "",
    last_name: "",
    first_name: "",
    phone: "",
    role: "superviseur",
    region_id: "",
    zone_id: "",
    wilaya_ids: [] as number[],
    distributeur_ids: [] as number[],
    active: true,
  };

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (open) {
      fetchGeography();
      fetchDistributors();
      if (user) {
        setForm({
          username: user.username || "",
          password: "",
          last_name: user.last_name || "",
          first_name: user.first_name || "",
          phone: user.phone || "",
          role: user.role || "superviseur",
          region_id: user.region_id?.toString() || "",
          zone_id: user.zone_id?.toString() || "",
          wilaya_ids: user.wilayas?.map((w: any) => w.id) || [],
          distributeur_ids: user.distributeur_ids || [],
          active: user.active ?? true,
        });
      } else {
        setForm(defaultForm);
      }
    }
  }, [open, user, fetchGeography, fetchDistributors]);

  const filteredZones = useMemo(() => {
    if (!form.region_id) return [];
    return zones.filter((z) => z.region_id.toString() === form.region_id);
  }, [zones, form.region_id]);

  const filteredWilayas = useMemo(() => {
    if (!form.zone_id) return [];
    return wilayas.filter((w) => w.zone_id.toString() === form.zone_id);
  }, [wilayas, form.zone_id]);

  // Filter distributors based on assigned wilayas for the supervisor
  const relevantDistributors = distributors.filter((d) =>
    form.wilaya_ids.includes(d.wilaya_id),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, password: form.password || undefined };
    const success = user
      ? await updateUser(user.id, payload)
      : await createUser(payload);
    if (success) onClose();
    setLoading(false);
  };

  const isGeoRequired = ["regional", "chef_zone", "superviseur"].includes(
    form.role,
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-5 border-b bg-gray-50">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {user ? (
              <UserCog className="w-5 h-5 text-amir-blue" />
            ) : (
              <UserPlus className="w-5 h-5 text-amir-blue" />
            )}
            {user ? "Modifier l'utilisateur" : "Nouvel Utilisateur"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden bg-zinc-50/50"
        >
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* ... Identification & Account Cards remain the same ... */}
            <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase text-zinc-400">
                  Nom *
                </Label>
                <Input
                  required
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase text-zinc-400">
                  Prénom *
                </Label>
                <Input
                  required
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                />
              </div>
              <div className={`space-y-1.5 ${user ? "col-span-2" : ""}`}>
                <Label className="text-[11px] font-black uppercase text-zinc-400">
                  Identifiant *
                </Label>
                <Input
                  required
                  value={form.username}
                  disabled={!!user}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
              </div>
              {user ? (
                ""
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-black uppercase text-zinc-400">
                    Mot De Passe *
                  </Label>
                  <Input
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
              )}
              <div className="space-y-1.5 col-span-2">
                <Label className="text-[11px] font-black uppercase text-zinc-400">
                  Rôle *
                </Label>

                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      role: v,
                      region_id: "",
                      zone_id: "",
                      wilaya_ids: [],
                      distributeur_ids: [],
                    })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choisir un rôle..." />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="regional">
                      Responsable Régional
                    </SelectItem>
                    <SelectItem value="chef_zone">Chef de Zone</SelectItem>
                    <SelectItem value="superviseur">Superviseur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Geography & Assignments */}
            {isGeoRequired && (
              <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-4">
                <h4 className="text-[10px] font-black uppercase text-amir-blue tracking-widest flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Affectation Territoriale
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-zinc-400">
                      Région
                    </Label>
                    <Select
                      value={form.region_id}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          region_id: v,
                          zone_id: "",
                          wilaya_ids: [],
                          distributeur_ids: [],
                        })
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((r) => (
                          <SelectItem key={r.id} value={r.id.toString()}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.role !== "regional" && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-zinc-400">
                        Zone
                      </Label>
                      <Select
                        disabled={!form.region_id}
                        value={form.zone_id}
                        onValueChange={(v) =>
                          setForm({
                            ...form,
                            zone_id: v,
                            wilaya_ids: [],
                            distributeur_ids: [],
                          })
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredZones.map((z) => (
                            <SelectItem key={z.id} value={z.id.toString()}>
                              {z.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {form.role === "superviseur" && (
                  <div className="space-y-4 pt-2 border-t">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-400">
                        Wilayas Supervisées
                      </Label>
                      <div className="grid grid-cols-2 gap-2 border border-zinc-200 p-3 rounded-xl bg-zinc-50/50 max-h-32 overflow-y-auto">
                        {filteredWilayas.map((w) => (
                          <div
                            key={w.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              checked={form.wilaya_ids.includes(w.id)}
                              onCheckedChange={(checked) => {
                                const next = checked
                                  ? [...form.wilaya_ids, w.id]
                                  : form.wilaya_ids.filter((id) => id !== w.id);
                                setForm({
                                  ...form,
                                  wilaya_ids: next,
                                  distributeur_ids: [],
                                });
                              }}
                            />
                            <span className="text-xs font-bold text-zinc-700">
                              {w.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-amir-blue flex items-center gap-2">
                        <Store className="w-3 h-3" /> Portefeuille Distributeurs
                      </Label>
                      <div className="border border-zinc-200 p-3 rounded-xl bg-zinc-50/50 max-h-40 overflow-y-auto space-y-2">
                        {relevantDistributors.length > 0 ? (
                          relevantDistributors.map((d) => (
                            <div
                              key={d.id}
                              className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-zinc-100"
                            >
                              <Checkbox
                                checked={form.distributeur_ids.includes(d.id)}
                                onCheckedChange={(checked) => {
                                  const next = checked
                                    ? [...form.distributeur_ids, d.id]
                                    : form.distributeur_ids.filter(
                                        (id) => id !== d.id,
                                      );
                                  setForm({ ...form, distributeur_ids: next });
                                }}
                              />
                              <span className="text-xs font-bold text-zinc-800">
                                {d.name}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-zinc-400 italic text-center py-4">
                            Sélectionnez des wilayas pour voir les
                            distributeurs.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="bg-white p-5 border-t">
            <Button variant="ghost" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="min-w-[160px] font-bold h-11 bg-amir-blue"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : user ? (
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
