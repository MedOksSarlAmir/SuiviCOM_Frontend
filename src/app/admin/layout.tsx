"use client";
import { Sidebar } from "@/components/Sidebar";
import { useAuthStore } from "@/stores/AuthStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const isChecking = !isAuthenticated || !user;

  useEffect(() => {
    if (isChecking) {
      router.replace("/login");
    }
  }, [isChecking, router]);

  if (isChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-amir-blue" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-zinc-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
