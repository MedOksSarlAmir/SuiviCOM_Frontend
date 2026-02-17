"use client";
import React, { useEffect, useState } from "react";
import { useDashboardStore } from "@/stores/supervisor/DashboardStore";
import { useObjectiveStore } from "@/stores/supervisor/ObjectiveStore";
import { useSalesStore } from "@/stores/supervisor/SaleStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  AlertTriangle,
  Package,
  Trophy,
  ArrowUpRight,
  Loader2,
  UserCheck,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PerformanceTable } from "@/components/superviseur/objectives/PerformanceTable";
import { Badge } from "@/components/ui/badge";
import { ModuleHeader } from "../shared/ModuleHeader";

export function SupervisorOverview() {
  const { stats, fetchStats, isLoading } = useDashboardStore();

  const { fetchPerformance, objectiveType, setObjectiveType } =
    useObjectiveStore();

  const {
    distributors,
    currentVendors,
    fetchDependencies,
    fetchVendorsByDistributor,
  } = useSalesStore();

  const [perfFilters, setPerfFilters] = useState({
    distributor_id: "",
    vendor_id: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchStats();
    fetchDependencies();
  }, [fetchStats, fetchDependencies]);

  useEffect(() => {
    if (perfFilters.distributor_id) {
      if (objectiveType === "vendor") {
        if (perfFilters.vendor_id) fetchPerformance(perfFilters);
      } else {
        fetchPerformance(perfFilters);
      }
    }
  }, [perfFilters, objectiveType, fetchPerformance]);

  if (isLoading)
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amir-blue" />
      </div>
    );

  if (!stats) return null;

  const { metrics, rankings } = stats;

  return (
    <div className="space-y-8 overflow-y-auto">
      {/* PAGE HEADER */}
      <ModuleHeader
        title="Vue d’ensemble superviseur"
        subtitle="Indicateurs globaux + suivi des objectifs opérationnels."
        icon={LayoutDashboard}
      />
      <div className="px-6">
        {/* KPI SECTION */}
        <section className="pb-6 space-y-4">
          <SectionTitle title="Indicateurs Clés" icon={TrendingUp} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Ventes Réalisées"
              value={`${metrics.sales.toLocaleString()} DA`}
              icon={<TrendingUp className="text-violet-600" />}
              description="Chiffre d'affaires vendeurs"
            />

            <MetricCard
              title="Achats Distributeurs"
              value={`${metrics.purchases.toLocaleString()} DA`}
              icon={<Package className="text-blue-600" />}
              description="Achats fournisseurs"
            />

            <MetricCard
              title="Couverture Visites"
              value={`${metrics.coverage}%`}
              icon={<UserCheck className="text-emerald-600" />}
              description="Visites réalisées"
              progress={metrics.coverage}
            />

            <MetricCard
              title="Alertes Stock"
              value={metrics.lowStockAlerts}
              icon={<AlertTriangle className="text-amber-600" />}
              description="Produits critiques"
              trend="Attention requise"
              trendColor="text-amber-600"
            />
          </div>
        </section>

        {/* RANKINGS */}
        <section className="py-6 space-y-4">
          <SectionTitle title="Classements" icon={Trophy} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top 5 Vendeurs</CardTitle>
                <Badge variant="secondary">Performance</Badge>
              </CardHeader>

              <CardContent className="space-y-3">
                {rankings.vendors.map((v: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-400">
                        #{i + 1}
                      </span>
                      <span className="font-semibold text-sm">{v.name}</span>
                    </div>

                    <span className="font-bold text-amir-blue">
                      {v.value.toLocaleString()} DA
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Produits les plus vendus</CardTitle>
                <Badge variant="secondary">Volume</Badge>
              </CardHeader>

              <CardContent className="space-y-3">
                {rankings.products.map((p: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{p.name}</span>
                      <span className="font-bold">{p.value} unités</span>
                    </div>

                    <div className="w-full h-1.5 bg-zinc-100 rounded-full">
                      <div
                        className="h-full bg-amir-blue/60 rounded-full"
                        style={{
                          width: `${
                            (p.value / (rankings.products[0]?.value || 1)) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* PERFORMANCE MODULE */}
        <section className="py-6 space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-zinc-900">
                  Pilotage des Objectifs
                </h2>
                <p className="text-sm text-zinc-500">
                  Analyse opérationnelle superviseur
                </p>
              </div>

              <div className="flex bg-zinc-100 p-1 rounded-lg">
                <button
                  onClick={() => setObjectiveType("vendor")}
                  className={cn(
                    "px-5 py-2 text-xs font-bold rounded-md",
                    objectiveType === "vendor"
                      ? "bg-amir-blue text-white"
                      : "text-zinc-600",
                  )}
                >
                  VENDEURS
                </button>

                <button
                  onClick={() => setObjectiveType("distributor")}
                  className={cn(
                    "px-5 py-2 text-xs font-bold rounded-md",
                    objectiveType === "distributor"
                      ? "bg-amir-blue text-white"
                      : "text-zinc-600",
                  )}
                >
                  DISTRIBUTEUR
                </button>
              </div>
            </div>

            {/* FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FilterSelect
                label="Distributeur"
                value={perfFilters.distributor_id}
                onChange={(v: any) => {
                  setPerfFilters({
                    ...perfFilters,
                    distributor_id: v,
                    vendor_id: "",
                  });
                  fetchVendorsByDistributor(parseInt(v));
                }}
                options={distributors.map((d) => ({
                  value: d.id.toString(),
                  label: d.name,
                }))}
              />

              {objectiveType === "vendor" && (
                <FilterSelect
                  label="Vendeur"
                  value={perfFilters.vendor_id}
                  onChange={(v: any) =>
                    setPerfFilters({ ...perfFilters, vendor_id: v })
                  }
                  options={currentVendors.map((v: any) => ({
                    value: v.id.toString(),
                    label: `${v.code} - ${v.name}`,
                  }))}
                />
              )}

              <FilterSelect
                label="Mois"
                value={perfFilters.month.toString()}
                onChange={(v: any) =>
                  setPerfFilters({ ...perfFilters, month: parseInt(v) })
                }
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: (i + 1).toString(),
                  label: new Date(0, i).toLocaleString("fr", {
                    month: "long",
                  }),
                }))}
              />
            </div>
          </div>

          <PerformanceTable />
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ title, icon: Icon }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-zinc-100">
        <Icon className="w-5 h-5 text-zinc-600" />
      </div>
      <h2 className="font-bold text-lg text-zinc-900">{title}</h2>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: any) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold text-zinc-500 uppercase">{label}</p>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-11">
          <SelectValue placeholder="Sélectionner..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((o: any) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  description,
  progress,
  trend,
  trendColor,
}: any) {
  return (
    <Card className="border-zinc-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold uppercase text-zinc-500">
            {title}
          </CardTitle>
          {icon}
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold text-zinc-900">{value}</div>
        <p className="text-xs text-zinc-400">{description}</p>

        {progress !== undefined && (
          <div className="w-full h-1 bg-zinc-100 rounded-full mt-3">
            <div
              className="h-full bg-amir-blue rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {trend && (
          <div
            className={cn(
              "text-xs font-bold mt-2 flex items-center gap-1",
              trendColor,
            )}
          >
            <ArrowUpRight className="w-3 h-3" /> {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
