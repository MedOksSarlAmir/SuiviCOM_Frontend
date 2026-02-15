"use client";
import React from "react";
import { useGeographyStore } from "@/stores/admin/GeographyStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface GeoTableProps {
  activeTab: "regions" | "zones" | "wilayas";
}

export function GeoTable({ activeTab }: GeoTableProps) {
  const {
    regions,
    zones,
    wilayas,
    isLoading,
    deleteRegion,
    deleteZone,
    deleteWilaya,
  } = useGeographyStore();

  const data =
    activeTab === "regions" ? regions : activeTab === "zones" ? zones : wilayas;

  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <span className="text-xs font-bold uppercase tracking-widest">
          Chargement...
        </span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-zinc-300 italic">
        <p>Aucune donnée pour cette catégorie.</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1">
      <Table>
        <TableHeader className="bg-zinc-50/80 sticky top-0 z-10 backdrop-blur-md border-b">
          <TableRow>
            <TableHead className="pl-6 h-12">Nom / Désignation</TableHead>
            {activeTab !== "regions" && (
              <TableHead className="h-12">Parent</TableHead>
            )}
            <TableHead className="text-right pr-6 h-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              className="hover:bg-zinc-50 transition-colors group"
            >
              <TableCell className="pl-6 py-4 font-bold text-zinc-700">
                {activeTab === "wilayas"
                  ? `${item.code} - ${item.name}`
                  : item.name}
              </TableCell>

              {activeTab !== "regions" && (
                <TableCell>
                  <span className="bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase px-2 py-1 rounded">
                    {activeTab === "zones" ? item.region_name : item.zone_name}
                  </span>
                </TableCell>
              )}

              <TableCell className="text-right pr-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  onClick={() => {
                    if (
                      confirm("Voulez-vous vraiment supprimer cet élément ?")
                    ) {
                      if (activeTab === "regions") deleteRegion(item.id);
                      if (activeTab === "zones") deleteZone(item.id);
                      if (activeTab === "wilayas") deleteWilaya(item.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
