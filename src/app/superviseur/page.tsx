"use client";
import { useAuthStore } from "@/stores/AuthStore";
import { SupervisorOverview } from "@/components/superviseur/SupervisorOverview";

export default function SupervisorDashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return <SupervisorOverview />;
}
