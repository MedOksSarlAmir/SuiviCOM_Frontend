"use client";
import { Sidebar } from "@/components/superviseur/Sidebar";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small timeout to allow Zustand to rehydrate from localStorage
    const timer = setTimeout(() => {
      if (!isAuthenticated || !user) {
        router.push("/login");
      } else {
        setIsChecking(false);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Show a full screen loader while checking auth state
  // This prevents the "Black Screen" of empty content
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
