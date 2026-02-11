"use client";
import { useAuthStore } from "@/stores/AuthStore";
import { LucideIcon } from "lucide-react";

interface ModuleHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function ModuleHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-amir-blue",
}: ModuleHeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center px-8 sticky top-0 z-10">
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className={`bg-zinc-100 p-2.5 rounded-lg`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {title}
            </h1>
            <p className="text-zinc-500 text-sm">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-l font-bold text-gray-900 leading-none mb-1">
              {user?.last_name} {user?.first_name}
            </p>
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
              Session Active
            </p>
          </div>
          <div className="flex flex-col items-start pl-6 border-l border-zinc-200">
            <p className="text-[15px] text-amir-blue font-bold uppercase tracking-tighter">
              {user?.role}
            </p>
            <p className="text-[12px] text-zinc-500 font-medium">
              {user?.geo_scope == "Wilaya" ? "Wilaya(s)": user?.geo_scope}:{" "}
              {user?.role === "superviseur"
                ? user?.wilayas && Array.from(user.wilayas).length > 0
                  ? Array.from(user.wilayas)
                      .map((w: any) => w.name)
                      .join(", ")
                  : "-"
                : user?.role === "chef_zone"
                  ? user?.zone || "National"
                  : user?.role === "regional"
                    ? user?.region || "National"
                    : "National"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
