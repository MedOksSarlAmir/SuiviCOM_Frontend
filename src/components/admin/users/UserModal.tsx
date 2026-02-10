"use client";
import React, { useState, useEffect } from "react";
import { useAdminUserStore } from "@/stores/AdminUserStore";
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
import { Loader2, UserCircle } from "lucide-react";

export function UserModal({ user, onClose }: any) {
  const { createUser, updateUser } = useAdminUserStore();
  const { regions, zones, wilayas, fetchGeography } = useGeographyStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: user?.username || "",
    password: "",
    role: user?.role || "superviseur",
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    region_id: user?.region_id?.toString() || "",
    zone_id: user?.zone_id?.toString() || "",
    wilaya_id: user?.wilaya_id?.toString() || "",
  });

  useEffect(() => {
    fetchGeography();
  }, [fetchGeography]);

  const filteredZones = zones.filter(
    (z) => z.region_id.toString() === form.region_id,
  );
  const filteredWilayas = wilayas.filter(
    (w) => w.zone_id.toString() === form.zone_id,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      region_id: form.region_id ? parseInt(form.region_id) : null,
      zone_id: form.zone_id ? parseInt(form.zone_id) : null,
      wilaya_id: form.wilaya_id ? parseInt(form.wilaya_id) : null,
    };
    const success = user
      ? await updateUser(user.id, payload)
      : await createUser(payload);
    if (success) onClose();
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-amir-blue" />
            {user ? "Modifier" : "Créer"} Utilisateur
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Identifiant (Login)</Label>
            <Input
              required
              value={form.username}
              disabled={!!user}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>
              {user ? "Nouveau Mot de passe (Optionnel)" : "Mot de passe"}
            </Label>
            <Input
              type="password"
              required={!user}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Rôle</Label>
            <Select
              value={form.role}
              onValueChange={(v) => setForm({ ...form, role: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dg">Directeur Général</SelectItem>
                <SelectItem value="dc">Directeur Commercial</SelectItem>
                <SelectItem value="regional">Chef Région</SelectItem>
                <SelectItem value="chef_zone">Chef Zone</SelectItem>
                <SelectItem value="superviseur">Superviseur</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Identité</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
              <Input
                placeholder="Prénom"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              />
            </div>
          </div>

          {["regional", "chef_zone", "superviseur"].includes(form.role) && (
            <div className="space-y-2">
              <Label>Région</Label>
              <Select
                value={form.region_id}
                onValueChange={(v) =>
                  setForm({ ...form, region_id: v, zone_id: "", wilaya_id: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir Région" />
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
          )}

          {["chef_zone", "superviseur"].includes(form.role) && (
            <div className="space-y-2">
              <Label>Zone</Label>
              <Select
                value={form.zone_id}
                onValueChange={(v) =>
                  setForm({ ...form, zone_id: v, wilaya_id: "" })
                }
                disabled={!form.region_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir Zone" />
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

          {form.role === "superviseur" && (
            <div className="space-y-2">
              <Label>Wilaya</Label>
              <Select
                value={form.wilaya_id}
                onValueChange={(v) => setForm({ ...form, wilaya_id: v })}
                disabled={!form.zone_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir Wilaya" />
                </SelectTrigger>
                <SelectContent>
                  {filteredWilayas.map((w) => (
                    <SelectItem key={w.id} value={w.id.toString()}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-amir-blue"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
