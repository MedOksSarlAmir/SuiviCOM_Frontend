"use client";
import React, { useState, useEffect } from "react";
import { useVisitStore } from "@/stores/VisitStore";
import { useSalesStore } from "@/stores/SaleStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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
import { ClipboardPlus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function NewVisitModal() {
  const { createVisit } = useVisitStore();
  const { distributors, currentVendors, fetchVendorsByDistributor } =
    useSalesStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    distributeurId: "",
    vendeurId: "",
    visites_programmees: 0,
    visites_effectuees: 0,
    nb_factures: 0,
    status: "programmées/non effectuée",
  });

  const handleDistChange = (id: string) => {
    setForm({ ...form, distributeurId: id, vendeurId: "" });
    if (id) fetchVendorsByDistributor(parseInt(id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await createVisit({
      ...form,
      distributeurId: parseInt(form.distributeurId),
      vendeurId: parseInt(form.vendeurId),
    });
    setLoading(false);
    if (success) setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amir-blue hover:bg-amir-blue-hover h-9">
          <ClipboardPlus className="w-4 h-4 mr-2" /> Programmer Visite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Rapport de Visite Terrain</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programmées/non effectuée">
                    Programmée
                  </SelectItem>
                  <SelectItem value="effectuée">Effectuée</SelectItem>
                  <SelectItem value="reportée">Reportée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Distributeur</Label>
              <Select
                value={form.distributeurId}
                onValueChange={handleDistChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
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
              <Label>Vendeur</Label>
              <Select
                value={form.vendeurId}
                onValueChange={(v) => setForm({ ...form, vendeurId: v })}
                disabled={!form.distributeurId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {currentVendors.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.nom} {v.prenom}{" "}
                      {!v.active && (
                        <Badge className="bg-gray-300">Inactif</Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-50 rounded-lg border">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold">Prog.</Label>
              <Input
                type="number"
                value={form.visites_programmees}
                onChange={(e) =>
                  setForm({
                    ...form,
                    visites_programmees: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold">Eff.</Label>
              <Input
                type="number"
                value={form.visites_effectuees}
                onChange={(e) =>
                  setForm({
                    ...form,
                    visites_effectuees: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold">
                Factures
              </Label>
              <Input
                type="number"
                value={form.nb_factures}
                onChange={(e) =>
                  setForm({ ...form, nb_factures: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="w-full bg-amir-blue"
              disabled={loading || !form.vendeurId}
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Valider le Rapport"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
