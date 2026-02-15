"use client";
import { useAuthStore } from "@/stores/AuthStore";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function ModuleHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-amir-blue",
  className,
}: ModuleHeaderProps) {
  const { user } = useAuthStore();

  return (
    <header
      className={cn(
        "h-24 bg-white border-b border-zinc-200 flex items-center px-8 sticky top-0 z-30 shrink-0",
        className,
      )}
    >
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="bg-zinc-100 p-3 rounded-xl">
            <Icon className={cn("w-7 h-7", iconColor)} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight leading-none mb-1">
              {title}
            </h1>
            <p className="text-zinc-500 text-sm font-medium">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-zinc-900 leading-none mb-1">
              {user?.last_name} {user?.first_name}
            </p>
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">
              {user?.username}
            </p>
          </div>
          <div className="flex flex-col items-start pl-6 border-l border-zinc-200">
            <p className="text-[13px] text-amir-blue font-black uppercase tracking-tight">
              {user?.role}
            </p>
            <p className="text-[11px] text-zinc-500 font-bold truncate max-w-[200px]">
              {user?.geo_scope}:{" "}
              {user?.role === "superviseur"
                ? Array.from(user.wilayas || [])
                    .map((w: any) => w.name)
                    .join(", ") || "Aucune"
                : user?.zone || user?.region || "National"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
