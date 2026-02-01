"use client";
import { useEffect } from "react";
import { useInventoryStore } from "@/stores/InventoryStore";
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
  Info,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function InventoryDetailModal({ product, distributorId, onClose }: any) {
  const {
    history,
    historyTotal,
    fetchHistory,
    isLoadingHistory,
    deleteAdjustment,
  } = useInventoryStore();

  useEffect(() => {
    if (product && distributorId) {
      fetchHistory(parseInt(distributorId), product.product_id, true);
    }
  }, [product, distributorId]);

  const handleLoadMore = () => {
    fetchHistory(parseInt(distributorId), product.product_id);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Supprimer cet ajustement ? Le stock sera mis à jour.")) {
      await deleteAdjustment(id);
      fetchHistory(parseInt(distributorId), product.product_id, true);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        {/* Unified Pro Header */}
        <DialogHeader className="p-6 bg-zinc-100 text-white">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-amir-beige mb-1">
              <History className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em]">
                Journal des Mouvements
              </span>
            </div>
            <DialogTitle className="text-xl font-bold flex justify-between items-center text-black">
              <span>{product?.designation}</span>
              <Badge className="bg-amir-blue text-white border-none hover:bg-amir-blue">
                {historyTotal} opérations
              </Badge>
            </DialogTitle>
            <p className="text-zinc-400 text-xs font-mono">
              ID Produit: #{product?.product_id}
            </p>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-white z-20 shadow-sm">
              <tr className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider border-b border-zinc-100">
                <th className="text-left py-4 px-6 font-bold">Date</th>
                <th className="text-left py-4 px-4 font-bold">Type</th>
                <th className="text-left py-4 px-4 font-bold">
                  Acteur / Justification
                </th>
                <th className="text-center py-4 px-4 font-bold">Variation</th>
                <th className="text-right py-4 px-6 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {history.map((h, i) => (
                <tr
                  key={`${h.id}-${i}`}
                  className="hover:bg-zinc-50/80 transition-colors group"
                >
                  <td className="py-4 px-6 text-zinc-600 font-medium whitespace-nowrap">
                    {format(new Date(h.date), "dd/MM/yyyy")}
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold uppercase border-none px-2 py-0.5",
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

                  {/* Fixed Width Cell with Tooltip for Long Notes */}
                  <td className="py-4 px-4 max-w-[240px]">
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold text-zinc-800 truncate">
                        {h.actor}
                      </p>
                      {h.note && (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 cursor-help">
                                <MessageSquare className="w-3 h-3 text-zinc-400 shrink-0" />
                                <p className="text-[11px] text-zinc-500 italic truncate border-b border-dotted border-zinc-300">
                                  {h.note}
                                </p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent
                              side="bottom"
                              className="max-w-[300px] bg-zinc-900 text-white p-3 rounded-lg border-none shadow-xl"
                            >
                              <p className="text-[11px] leading-relaxed">
                                {h.note}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </td>

                  <td
                    className={cn(
                      "py-4 px-4 text-center font-bold tabular-nums",
                      h.qte > 0 ? "text-emerald-600" : "text-red-600",
                    )}
                  >
                    {h.qte > 0 ? `+${h.qte}` : h.qte}
                  </td>

                  <td className="py-4 px-6 text-right">
                    {h.type === "DECALAGE" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-300 hover:text-red-600 hover:bg-red-50 transition-all rounded-full"
                        onClick={() => handleDelete(h.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    ) : (
                      <div className="h-8 w-8" /> /* Space maintainer */
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {history.length < historyTotal && (
            <div className="p-8 flex justify-center bg-zinc-50/30">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingHistory}
                className="bg-white border-zinc-200 text-zinc-500 hover:text-amir-blue hover:border-amir-blue transition-all h-9 px-6 rounded-full"
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

          {!isLoadingHistory && history.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-2">
              <History className="w-10 h-10 text-zinc-100" />
              <p className="text-zinc-400 italic text-sm">
                Aucun mouvement trouvé.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
