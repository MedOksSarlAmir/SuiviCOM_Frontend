"use client";
import React, { useEffect } from "react";
import { useDashboardStore } from "@/stores/DashboardStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  ClipboardCheck,
  AlertTriangle,
  BarChart3,
  Package,
  Trophy,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function SupervisorOverview() {
  const { stats, fetchStats, isLoading } = useDashboardStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading)
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amir-blue" />
      </div>
    );

  if (!stats) return null;

  const { metrics, rankings } = stats;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          Vue d&apos;ensemble
        </h1>
        <p className="text-zinc-500">
          Statistiques de performance pour le mois en cours.
        </p>
      </div>

      {/* Row 1: Vital Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ventes Réalisées"
          value={`${metrics.sales.toLocaleString()} DA`}
          icon={<TrendingUp className="text-emerald-600" />}
          description="Chiffre d'affaires total vendeurs"
        />
        <MetricCard
          title="Achats Distributeurs"
          value={`${metrics.purchases.toLocaleString()} DA`}
          icon={<Package className="text-amir-blue" />}
          description="Total achats distributeurs"
        />
        <MetricCard
          title="Couverture Visites"
          value={`${metrics.coverage}%`}
          icon={<ClipboardCheck className="text-purple-600" />}
          description="Visites effectuées vs. prévues"
          progress={metrics.coverage}
        />
        <MetricCard
          title="Alertes Stock"
          value={metrics.lowStockAlerts}
          icon={<AlertTriangle className="text-amber-600" />}
          description="Produits < 5 unités en stock"
          trend="Attention requise"
          trendColor="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Vendors */}
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <CardTitle className="text-lg">Top 5 Vendeurs (Ventes)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rankings.vendors.map((v: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-400 w-4">
                    #{i + 1}
                  </span>
                  <span className="font-semibold text-sm text-zinc-700">
                    {v.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-amir-blue">
                  {v.value.toLocaleString()} DA
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amir-blue" />
            <CardTitle className="text-lg">
              Produits les plus vendus (Quantité)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rankings.products.map((p: any, i: number) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-zinc-600">{p.name}</span>
                  <span className="font-bold">{p.value} unités</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amir-blue/60"
                    style={{
                      width: `${(p.value / rankings.products[0].value) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
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
    <Card className="border-zinc-200 shadow-sm overflow-hidden relative">
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            {title}
          </CardTitle>
          <div className="p-2 bg-zinc-50 rounded-lg">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-zinc-900">{value}</div>
        <p className="text-[10px] text-zinc-400 mt-1">{description}</p>
        {progress !== undefined && (
          <div className="w-full h-1 bg-zinc-100 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-amir-blue transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {trend && (
          <div
            className={cn(
              "text-[10px] font-bold mt-2 flex items-center gap-1",
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
