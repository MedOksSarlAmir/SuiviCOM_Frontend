"use client";
import { useAuthStore } from "@/stores/authStore";
import { SupervisorOverview } from "@/components/superviseur/roles/SupervisorOverview";

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  switch (user.role) {
    case "superviseur":
      return <SupervisorOverview />;
    // case "admin": return <AdminOverview />; // For later
    default:
      return (
        <div className="p-8 bg-white rounded-xl border border-zinc-200 text-center">
          <p className="text-zinc-500 text-lg">Bienvenue sur SuiviCom AMIR.</p>
          <p className="text-zinc-400 text-sm italic">
            Accès configuré pour : {user.role}
          </p>
        </div>
      );
  }
}
