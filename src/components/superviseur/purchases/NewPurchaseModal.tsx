"use client";
import React, { useState, useEffect, useMemo } from "react";
import { usePurchaseStore } from "@/stores/PurchaseStore";
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
import {
  Plus,
  ShoppingBag,
  Loader2,
  Search,
  PackageCheck,
  Banknote,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { PaginationControl } from "@/components/ui/pagination-control";
import { cn } from "@/lib/utils";

export function NewPurchaseModal() {
  const {
    distributors,
    products, // Full product list for price lookups
    createPurchase,
    fetchPurchaseMatrix,
    fetchDependencies: fetchPurchaseDeps,
    matrix,
    matrixTotal,
    isMatrixLoading,
  } = usePurchaseStore();

  const { categories, fetchDependencies: fetchSalesDeps } = useSalesStore();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [header, setHeader] = useState({
    distributeurId: "",
    date: new Date().toISOString().split("T")[0],
    status: "en_cours",
  });

  const [localQtys, setLocalQtys] = useState<Record<number, number>>({});
  const [gridFilters, setGridFilters] = useState({
    search: "",
    category: "all",
    page: 1,
  });

  useEffect(() => {
    if (open) {
      fetchSalesDeps();
      fetchPurchaseDeps();
      fetchPurchaseMatrix({ ...gridFilters, pageSize: 25 });
    }
  }, [
    open,
    gridFilters,
    fetchPurchaseMatrix,
    fetchSalesDeps,
    fetchPurchaseDeps,
  ]);

  const handleQtyChange = (id: number, val: string) => {
    const q = parseInt(val) || 0;
    setLocalQtys((prev) => ({ ...prev, [id]: q }));
  };

  // Improved totals calculation that works across multiple pages
  const totals = useMemo(() => {
    let units = 0;
    let amount = 0;

    Object.entries(localQtys).forEach(([id, qty]) => {
      if (qty > 0) {
        units += qty;
        // Search in the full products list (loaded in store) to get the price
        // even if the product is not on the current matrix page.
        const p = products.find((prod) => prod.id === parseInt(id));
        if (p) {
          amount += qty * (p.price_factory || 0);
        }
      }
    });

    return { units, amount };
  }, [localQtys, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productsPayload = Object.entries(localQtys)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ product_id: parseInt(id), quantity: qty }));

    if (productsPayload.length === 0) {
      alert("Veuillez saisir au moins une quantité avant de valider.");
      return;
    }

    setLoading(true);
    const success = await createPurchase({
      ...header,
      products: productsPayload,
    });
    setLoading(false);

    if (success) {
      setOpen(false);
      setLocalQtys({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amir-blue text-white h-9 shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Nouvel Achat
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-5xl max-h-[95vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-5 border-b bg-white">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <ShoppingBag className="w-6 h-6 text-amir-blue" />
            Nouvel Approvisionnement
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-zinc-50/50">
            <div className="p-4 bg-white rounded-xl border border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-6 shadow-sm">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase text-zinc-400 ml-1">
                  Date d&apos;achat
                </Label>
                <Input
                  type="date"
                  value={header.date}
                  onChange={(e) =>
                    setHeader({ ...header, date: e.target.value })
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase text-zinc-400 ml-1">
                  Distributeur
                </Label>
                <Select
                  value={header.distributeurId}
                  onValueChange={(v) =>
                    setHeader({ ...header, distributeurId: v })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Partenaire usine..." />
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
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase text-zinc-400 ml-1">
                  État
                </Label>
                <Select
                  value={header.status}
                  onValueChange={(v) => setHeader({ ...header, status: v })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_cours">
                      🟡 En cours (Brouillon)
                    </SelectItem>
                    <SelectItem value="complete">
                      🟢 Validée (Stock mis à jour)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  placeholder="Chercher une référence ou désignation..."
                  className="pl-10 h-10 border-zinc-200"
                  value={gridFilters.search}
                  onChange={(e) =>
                    setGridFilters({
                      ...gridFilters,
                      search: e.target.value,
                      page: 1,
                    })
                  }
                />
              </div>
              <Select
                value={gridFilters.category}
                onValueChange={(v) =>
                  setGridFilters({ ...gridFilters, category: v, page: 1 })
                }
              >
                <SelectTrigger className="w-full sm:w-[220px] h-10">
                  <SelectValue placeholder="Famille" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les familles</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden relative shadow-sm">
              {isMatrixLoading && (
                <div className="absolute inset-0 bg-white/60 z-20 flex flex-col items-center justify-center backdrop-blur-[1px]">
                  <Loader2 className="animate-spin text-amir-blue w-8 h-8 mb-2" />
                </div>
              )}

              <Table>
                <TableHeader className="bg-zinc-50 border-b">
                  <TableRow>
                    <TableHead className="pl-6 h-12">Produit</TableHead>
                    <TableHead className="h-12">Prix Usine</TableHead>
                    <TableHead className="w-[160px] text-center h-12 pr-6">
                      Quantité
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrix.map((p) => {
                    const currentQty = localQtys[p.product_id] ?? 0;
                    const isSelected = currentQty > 0;
                    return (
                      <TableRow
                        key={p.product_id}
                        className={cn(
                          "transition-all duration-200",
                          isSelected
                            ? "bg-amir-blue/[0.03] hover:bg-amir-blue/[0.06]"
                            : "hover:bg-zinc-50",
                        )}
                      >
                        <TableCell className="pl-6 py-3">
                          <p
                            className={cn(
                              "text-sm transition-colors",
                              isSelected
                                ? "font-bold text-zinc-900"
                                : "font-medium text-zinc-600",
                            )}
                          >
                            {p.designation}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono tracking-wider">
                            {p.code}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-zinc-500">
                          {p.price_factory.toLocaleString()}{" "}
                          <span className="text-[10px]">DA</span>
                        </TableCell>
                        <TableCell className="py-2 pr-6">
                          <Input
                            type="number"
                            className={cn(
                              "text-center h-9 transition-all border-zinc-200",
                              isSelected
                                ? "font-black text-amir-blue border-amir-blue ring-2 ring-amir-blue/10 bg-white"
                                : "text-zinc-300 font-normal bg-transparent",
                            )}
                            value={currentQty || ""}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) =>
                              handleQtyChange(p.product_id, e.target.value)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="p-3 border-t bg-zinc-50/50">
                <PaginationControl
                  total={matrixTotal}
                  limit={25}
                  page={gridFilters.page}
                  onPageChange={(p) =>
                    setGridFilters({ ...gridFilters, page: p })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="bg-white p-5 border-t flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="bg-amir-blue/10 p-2 rounded-lg">
                  <PackageCheck className="w-5 h-5 text-amir-blue" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-bold text-zinc-400 uppercase mb-1">
                    Total Unités
                  </span>
                  <span className="text-xl font-black text-amir-blue">
                    {totals.units.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xs font-bold text-zinc-400 uppercase mb-1">
                    Montant Estimé
                  </span>
                  <span className="text-xl font-black text-emerald-600">
                    {totals.amount.toLocaleString()}{" "}
                    <span className="text-sm">DA</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-zinc-500"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-amir-blue hover:bg-amir-blue-hover min-w-[160px] font-bold h-11"
                disabled={loading || !header.distributeurId}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Valider l'achat"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
