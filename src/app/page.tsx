"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token || !user) router.replace("/login");
  }, [token, user, router]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50">
      <Loader2 className="w-10 h-10 animate-spin text-zinc-400 mb-4" />
      <p className="text-zinc-500 font-medium animate-pulse">
        Chargement de votre session...
      </p>
    </div>
  );
}
