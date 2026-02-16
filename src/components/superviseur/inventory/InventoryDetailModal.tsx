"use client";
import { useEffect, useState, useCallback } from "react";
import { useInventoryStore } from "@/stores/supervisor/InventoryStore";
import { useSalesStore } from "@/stores/supervisor/SaleStore";
import { useAuthStore } from "@/stores/AuthStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Trash2,
  ChevronDown,
  History,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function InventoryDetailModal({ product, distributorId, onClose }: any) {
  const { user } = useAuthStore();
  const {
    history,
    historyTotal,
    fetchHistory,
    isLoadingHistory,
    deleteAdjustment,
  } = useInventoryStore();
  const { currentVendors, fetchVendorsByDistributor } = useSalesStore();

  // Filter State
  const [filters, setFilters] = useState({
    type: "all",
    vendor_id: "all",
    startDate: "",
    endDate: "",
    onlyMine: "all", // "all" | "mine"
  });

  useEffect(() => {
    if (distributorId) fetchVendorsByDistributor(parseInt(distributorId));
  }, [distributorId, fetchVendorsByDistributor]);

  const loadData = useCallback(
    (reset = false) => {
      if (product && distributorId) {
        fetchHistory(
          parseInt(distributorId),
          product.product_id,
          reset,
          filters as any,
        );
      }
    },
    [product, distributorId, fetchHistory, filters],
  );

  useEffect(() => {
    loadData(true);
  }, [filters, loadData]);

  const handleLoadMore = () => loadData(false);

  const handleDelete = async (id: number) => {
    if (confirm("Supprimer cet ajustement ? Le stock sera mis à jour.")) {
      await deleteAdjustment(id);
      loadData(true);
    }
  };

  const isVendorFilterDisabled =
    filters.type === "ACHAT" || filters.type === "DECALAGE";

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 bg-white border-b">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-amir-blue mb-1">
                  <History className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">
                    Journal des Mouvements
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold text-zinc-900">
                  {product?.product_name || product?.name}
                </DialogTitle>
                <p className="text-zinc-400 text-xs font-mono">
                  ID: #{product?.product_id} | Code: {product?.product_code}
                </p>
              </div>
              <Badge className="bg-amir-blue text-white border-none h-6">
                {historyTotal} opérations
              </Badge>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              {/* Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                  Type
                </label>
                <Select
                  value={filters.type}
                  onValueChange={(v) =>
                    setFilters((f) => ({
                      ...f,
                      type: v,
                      vendor_id:
                        v !== "VENTE" && v !== "all" ? "all" : f.vendor_id,
                    }))
                  }
                >
                  <SelectTrigger className="h-8 bg-white text-xs">
                    <SelectValue placeholder="Tous types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="ACHAT">Achats Dist.</SelectItem>
                    <SelectItem value="VENTE">Ventes Vendeurs</SelectItem>
                    <SelectItem value="DECALAGE">Ajustements</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vendor */}
              <div className="space-y-1">
                <label
                  className={cn(
                    "text-[10px] font-bold uppercase ml-1 transition-colors",
                    isVendorFilterDisabled ? "text-zinc-300" : "text-zinc-400",
                  )}
                >
                  Vendeur
                </label>
                <Select
                  disabled={isVendorFilterDisabled}
                  value={filters.vendor_id}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, vendor_id: v }))
                  }
                >
                  <SelectTrigger className="h-8 bg-white text-xs">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les vendeurs</SelectItem>
                    {currentVendors.map((v) => (
                      <SelectItem key={v.id} value={v.id.toString()}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                  Du
                </label>
                <Input
                  type="date"
                  className="h-8 bg-white text-xs"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, startDate: e.target.value }))
                  }
                />
              </div>

              {/* End */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                  Au
                </label>
                <Input
                  type="date"
                  className="h-8 bg-white text-xs"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, endDate: e.target.value }))
                  }
                />
              </div>

              {/* Only Mine */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase ml-1">
                  Superviseurs
                </label>
                <Select
                  value={filters.onlyMine}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, onlyMine: v }))
                  }
                >
                  <SelectTrigger className="h-8 bg-white text-xs">
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Touts</SelectItem>
                    <SelectItem value="mine">Uniquement moi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Table */}
        <div className="flex-1 overflow-y-auto relative min-h-[400px] bg-white">
          {isLoadingHistory && history.length > 0 && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-30 flex items-center justify-center">
              <Loader2 className="animate-spin text-amir-blue w-8 h-8" />
            </div>
          )}

          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-zinc-50 z-20 shadow-sm">
              <tr className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider border-b">
                <th className="text-left py-3 px-6">Instant T</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">
                  Acteur / Note / Supervisor
                </th>
                <th className="text-center py-3 px-4">Variation</th>
                <th className="text-right py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {history.map((h, i) => (
                <tr
                  key={`${h.id}-${i}`}
                  className="hover:bg-zinc-50/50 transition-colors group"
                >
                  {/* Date */}
                  <td className="py-4 px-6 text-zinc-600 font-mono text-xs whitespace-nowrap">
                    {h.date
                      ? format(new Date(h.date), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </td>

                  {/* Type */}
                  <td className="py-4 px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-black border-none px-2 py-0.5 uppercase",
                        h.type === "ACHAT"
                          ? "bg-emerald-50 text-emerald-600"
                          : h.type === "VENTE"
                            ? "bg-amir-blue/10 text-amir-blue"
                            : "bg-amber-50 text-amber-600",
                      )}
                    >
                      {h.type}
                    </Badge>
                  </td>

                  {/* Actor / Note / Supervisor */}
                  <td className="py-4 px-4 max-w-[280px]">
                    <div className="flex flex-col gap-1">
                      {/* Actor */}
                      <p className="font-semibold text-zinc-800 text-xs truncate">
                        <span className="font-light">
                          {h.type === "VENTE"
                            ? `Vendeur: `
                            : h.type === "ACHAT"
                              ? `Distributeur: `
                              : `Superviseur: `}
                        </span>
                        {h.actor}
                      </p>

                      {/* Supervisor badge */}
                      {h.supervisor_name && (
                        <Badge className="bg-purple-100 text-purple-800 text-[10px] w-fit">
                          Supervisor: {h.supervisor_name}
                        </Badge>
                      )}

                      {/* Note */}
                      {h.note && (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 cursor-help w-fit">
                                <MessageSquare className="w-3 h-3 text-zinc-400 shrink-0" />
                                <p className="text-[11px] text-zinc-400 italic truncate border-b border-dotted border-zinc-200 max-w-[200px]">
                                  {h.note}
                                </p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px] bg-zinc-900 text-white p-3 rounded-lg border-none shadow-xl">
                              <p className="text-[11px] leading-relaxed">
                                {h.note}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </td>

                  {/* Variation */}
                  <td
                    className={cn(
                      "py-4 px-4 text-center font-black tabular-nums",
                      h.quantity > 0 ? "text-emerald-600" : "text-red-500",
                    )}
                  >
                    {h.quantity > 0 ? `+${h.quantity}` : h.quantity}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    {h.type === "DECALAGE" && h.supervisor_id === user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-300 hover:text-red-600 transition-all rounded-full"
                        onClick={() => handleDelete(h.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty state */}
          {history.length === 0 && !isLoadingHistory && (
            <div className="py-24 text-center flex flex-col items-center gap-4">
              <History className="w-12 h-12 text-zinc-100" />
              <p className="text-zinc-400 text-sm italic">
                Aucun mouvement trouvé avec ces filtres.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({
                    type: "all",
                    vendor_id: "all",
                    startDate: "",
                    endDate: "",
                    onlyMine: "all",
                  })
                }
                className="rounded-full text-[11px]"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}

          {/* Load more */}
          {history.length > 0 && history.length < historyTotal && (
            <div className="p-8 flex justify-center border-t bg-zinc-50/30">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingHistory}
                className="bg-white border-zinc-200 text-zinc-500 hover:text-amir-blue transition-all h-9 px-10 rounded-full text-xs font-bold"
              >
                {isLoadingHistory ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 mr-2" />
                )}
                Charger plus de mouvements
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
