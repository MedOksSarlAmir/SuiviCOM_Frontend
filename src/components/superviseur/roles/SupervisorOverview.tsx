"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useDashboardStore } from "@/stores/dashboardStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Users, CheckCircle, TrendingUp, Loader2, AlertCircle } from "lucide-react";

export function SupervisorOverview() {
  const { user } = useAuthStore();
  const { stats, isLoading, error, fetchStats } = useDashboardStore();

  useEffect(() => {
    if (user?.role && user?.id) {
      fetchStats(user.role, user.id);
    }
  }, [user, fetchStats]);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-amir-blue" />
          <p className="text-zinc-500 text-sm">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  // 3. Helper to format currency safely
  const formatCurrency = (val: number | undefined) => {
    return new Intl.NumberFormat('fr-DZ', { 
      style: 'currency', 
      currency: 'DZD' 
    }).format(val || 0);
  };

  const kpis = [
    {
      title: "Chiffre d'Affaires",
      value: formatCurrency(stats?.salesAmount),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Visites Réalisées",
      value: `${stats?.completedVisits || 0} / ${stats?.totalVisits || 0}`,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Distributeurs Actifs",
      value: stats?.topDistributors?.length || 0,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="p-8 border border-zinc-200 rounded-xl bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900">Tableau de Bord</h1>
        <p className="text-zinc-500 mt-1">
          Bienvenue, <span className="text-amir-blue font-semibold">{user?.prenom} {user?.nom}</span>. 
          Zone: <span className="text-zinc-900 font-medium">{user?.wilaya || "N/A"}</span>.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="border-zinc-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}