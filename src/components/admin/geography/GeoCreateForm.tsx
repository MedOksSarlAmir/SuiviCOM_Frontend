"use client";
import React, { useState } from "react";
import { useGeographyStore } from "@/stores/admin/GeographyStore";
import { Plus, Loader2 } from "lucide-react";
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

interface GeoCreateFormProps {
  activeTab: "regions" | "zones" | "wilayas";
}

export function GeoCreateForm({ activeTab }: GeoCreateFormProps) {
  const { regions, zones, addRegion, addZone, addWilaya } = useGeographyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    parentId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let success = false;

    if (activeTab === "regions") success = await addRegion(formData.name);
    if (activeTab === "zones")
      success = await addZone(formData.name, parseInt(formData.parentId));
    if (activeTab === "wilayas")
      success = await addWilaya(
        formData.name,
        formData.code,
        parseInt(formData.parentId),
      );

    if (success) setFormData({ name: "", code: "", parentId: "" });
    setIsSubmitting(false);
  };

  const parentLabel = activeTab === "zones" ? "Région" : "Zone";
  const parents = activeTab === "zones" ? regions : zones;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-amir-blue/10 rounded-lg">
          <Plus className="w-4 h-4 text-amir-blue" />
        </div>
        <h3 className="font-bold text-zinc-800 uppercase text-xs tracking-wider">
          Ajouter {activeTab.slice(0, -1)}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab !== "regions" && (
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-black text-zinc-400">
              Rattachement ({parentLabel})
            </Label>
            <Select
              value={formData.parentId}
              onValueChange={(v) => setFormData({ ...formData, parentId: v })}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder={`Choisir ${parentLabel}...`} />
              </SelectTrigger>
              <SelectContent>
                {parents.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {activeTab === "wilayas" && (
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-black text-zinc-400">
              Code Wilaya
            </Label>
            <Input
              placeholder="Ex: 31"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="h-11"
              required
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase font-black text-zinc-400">
            Désignation
          </Label>
          <Input
            placeholder="Nom..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-11"
            required
          />
        </div>

        <Button
          className="w-full bg-amir-blue h-11 font-bold shadow-md shadow-amir-blue/20"
          disabled={
            isSubmitting || (activeTab !== "regions" && !formData.parentId)
          }
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : "Enregistrer"}
        </Button>
      </form>
    </div>
  );
}
