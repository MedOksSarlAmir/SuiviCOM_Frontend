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
import { CalendarClock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EditVisitModalProps {
  visit: any;
  onClose: () => void;
}

export function EditVisitModal({ visit, onClose }: EditVisitModalProps) {
  const { updateVisit } = useVisitStore();
  const { distributors, currentVendors, fetchVendorsByDistributor } =
    useSalesStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: "",
    distributeurId: "",
    vendeurId: "",
    visites_programmees: 0,
    visites_effectuees: 0,
    nb_factures: 0,
    status: "",
  });
  useEffect(() => {
    if (visit) {
      setForm({
        date: visit.date ? visit.date.split("T")[0] : "",
        distributeurId: visit.distributeur_id?.toString() || "",
        vendeurId: visit.vendeur_id?.toString() || "",
        visites_programmees: visit.visites_programmees || 0,
        visites_effectuees: visit.visites_effectuees || 0,
        nb_factures: visit.nb_factures || 0,
        status: visit.status || "programmées/non effectuée",
      });
      // Load vendors for the specific distributor
      if (visit.distributor_id) {
        fetchVendorsByDistributor(visit.distributor_id);
      }
    }
  }, [visit, fetchVendorsByDistributor]);

  const handleDistChange = (id: string) => {
    setForm({ ...form, distributeurId: id, vendeurId: "" });
    if (id) fetchVendorsByDistributor(parseInt(id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Note: Backend Visit Update logic expects 'vendeurId' specifically in the controller
    const success = await updateVisit(visit.id, {
      date: form.date,
      status: form.status,
      vendeurId: parseInt(form.vendeurId),
      visites_programmees: form.visites_programmees,
      visites_effectuees: form.visites_effectuees,
      nb_factures: form.nb_factures,
    });

    setLoading(false);
    if (success) onClose();
  };

  return (
    <Dialog open={!!visit} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-purple-600" />
            Modifier Visite Rapport #{visit?.id}
          </DialogTitle>
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
                  <SelectItem value="annulée">Annulée</SelectItem>
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
              <Label className="text-[10px] uppercase font-bold">
                Programmées
              </Label>
              <Input
                type="number"
                value={form.visites_programmees}
                onChange={(e) =>
                  setForm({
                    ...form,
                    visites_programmees: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold">
                Effectuées
              </Label>
              <Input
                type="number"
                value={form.visites_effectuees}
                onChange={(e) =>
                  setForm({
                    ...form,
                    visites_effectuees: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold">
                Nb Factures
              </Label>
              <Input
                type="number"
                value={form.nb_factures}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nb_factures: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-purple-600"
              disabled={loading || !form.vendeurId}
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
