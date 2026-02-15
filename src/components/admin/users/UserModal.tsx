"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAdminUserStore } from "@/stores/admin/UserStore";
import { useGeographyStore } from "@/stores/admin/GeographyStore";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserPlus,
  Loader2,
  MapPin,
  Shield,
  Key,
  User as UserIcon,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function UserModal({ user, open, onClose }: any) {
  const { regions, zones, wilayas, fetchGeography } = useGeographyStore();
  const { createUser, updateUser } = useAdminUserStore();
  const [loading, setLoading] = useState(false);

  // Use keys identical to the backend Model
  const [form, setForm] = useState(() => ({
    username: user?.username || "",
    password: "",
    last_name: user?.last_name || "",
    first_name: user?.first_name || "",
    phone: user?.phone || "",
    role: user?.role || "superviseur",
    region_id: user?.region_id?.toString() || "",
    zone_id: user?.zone_id?.toString() || "",
    wilaya_ids: user?.wilayas?.map((w: any) => w.id) || [],
    active: user?.active ?? true,
  }));

  useEffect(() => {
    if (open) {
      fetchGeography();
    }
  }, [open, fetchGeography]);

  // Hierarchy calculations using Memo for performance and strict type check
  const filteredZones = useMemo(() => {
    if (!form.region_id) return [];
    return zones.filter((z) => z.region_id.toString() === form.region_id);
  }, [zones, form.region_id]);

  const filteredWilayas = useMemo(() => {
    if (!form.zone_id) return [];
    return wilayas.filter((w) => w.zone_id.toString() === form.zone_id);
  }, [wilayas, form.zone_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      region_id: form.region_id ? parseInt(form.region_id) : null,
      zone_id: form.zone_id ? parseInt(form.zone_id) : null,
      password: form.password || undefined,
    };

    const success = user
      ? await updateUser(user.id, payload)
      : await createUser(payload);

    if (success) {
      setForm({
        username: "",
        password: "",
        last_name: "",
        first_name: "",
        phone: "",
        role: "superviseur",
        region_id: "",
        zone_id: "",
        wilaya_ids: [],
        active: true,
      });
      onClose();
    }
    setLoading(false);
  };

  const isGeoRequired = ["regional", "chef_zone", "superviseur"].includes(
    form.role,
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        {/* Header */}
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden bg-zinc-50/50"
        >
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* --- Identity Card --- */}
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
                  className={
                    !form.last_name ? "border-amber-400 bg-amber-50" : ""
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
                  className={
                    !form.first_name ? "border-amber-400 bg-amber-50" : ""
                  }
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label className="text-[11px] font-black uppercase text-zinc-400">
                  Téléphone{" "}
                  <span className="font-normal text-zinc-400">(optionnel)</span>
                </Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            {/* --- Account Card --- */}
            <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
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
                  className={
                    !form.username ? "border-amber-400 bg-amber-50" : ""
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase text-zinc-400">
                  {user ? "Nouveau mot de passe" : "Mot de passe *"}
                </Label>
                <Input
                  type="password"
                  required={!user}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className={
                    !user && !form.password
                      ? "border-amber-400 bg-amber-50"
                      : ""
                  }
                />
              </div>
            </div>

            {/* --- Role & Status Card --- */}
            <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
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
                    })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "admin",
                      "dg",
                      "dc",
                      "regional",
                      "chef_zone",
                      "superviseur",
                    ].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
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
                      "h-10",
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

            {/* --- Geography Card (if required) --- */}
            {isGeoRequired && (
              <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-4">
                <h4 className="text-[10px] font-black uppercase text-amir-blue tracking-widest flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Affectation Territoriale
                </h4>

                <div className="space-y-4">
                  {/* Region */}
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
                        })
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Choisir une région" />
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

                  {/* Zone */}
                  {(form.role === "chef_zone" ||
                    form.role === "superviseur") && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-zinc-400">
                        Zone
                      </Label>
                      <Select
                        disabled={!form.region_id}
                        value={form.zone_id}
                        onValueChange={(v) =>
                          setForm({ ...form, zone_id: v, wilaya_ids: [] })
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Choisir une zone" />
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

                  {/* Wilayas */}
                  {form.role === "superviseur" && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-zinc-400">
                        Wilayas Supervisées
                      </Label>
                      <div className="grid grid-cols-2 gap-2 border border-zinc-200 p-3 rounded-xl bg-white max-h-40 overflow-y-auto">
                        {filteredWilayas.length > 0 ? (
                          filteredWilayas.map((w: any) => (
                            <div
                              key={w.id}
                              className="flex items-center space-x-2 p-1.5 hover:bg-zinc-50 rounded-lg transition-colors"
                            >
                              <Checkbox
                                id={`w-${w.id}`}
                                checked={form.wilaya_ids.includes(w.id)}
                                onCheckedChange={(checked) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    wilaya_ids: checked
                                      ? [...prev.wilaya_ids, w.id]
                                      : prev.wilaya_ids.filter(
                                          (id: string) => id !== w.id,
                                        ),
                                  }))
                                }
                              />
                              <label
                                htmlFor={`w-${w.id}`}
                                className="text-xs font-bold text-zinc-700 cursor-pointer"
                              >
                                {w.name}
                              </label>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 py-4 text-center text-zinc-400 text-[10px] italic">
                            Sélectionnez d&apos;abord une Zone pour voir les
                            wilayas.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                !form.username ||
                  !form.last_name ||
                  !form.first_name ||
                  (!user && !form.password)
                  ? "bg-amber-400 hover:bg-amber-500 text-white"
                  : "bg-amir-blue hover:bg-amir-blue-hover text-white",
              )}
              disabled={
                loading ||
                !form.username ||
                !form.last_name ||
                !form.first_name ||
                (!user && !form.password)
              }
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
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
