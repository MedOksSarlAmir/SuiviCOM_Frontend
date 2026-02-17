"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/AuthStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Target,
  Package,
  MapIcon,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  LogOut,
  Users,
  ShieldCheck,
  Map,
  Store,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MENU_CONFIG = {
  admin: [
    { name: "Utilisateurs", href: "/admin/users", icon: Users },
    { name: "Produits", href: "/admin/products", icon: Package },
    { name: "Distributeurs", href: "/admin/distributors", icon: Store },
    { name: "Geographie", href: "/admin/geography", icon: MapIcon },
  ],
  superviseur: [
    { name: "Vue d'ensemble", href: "/superviseur", icon: LayoutDashboard },
    { name: "Ventes Vendeurs", href: "/superviseur/sales", icon: ShoppingCart },
    { name: "Achats Dist.", href: "/superviseur/purchases", icon: ShoppingBag },
    {
      name: "Visites Terrain",
      href: "/superviseur/visits",
      icon: ClipboardCheck,
    },
    { name: "Objectifs", href: "/superviseur/objectives", icon: Target },
    { name: "Inventaire", href: "/superviseur/inventory", icon: Package },
    { name: "Mes Vendeurs", href: "/superviseur/vendors", icon: Users },
  ],
  dg: [
    { name: "National Overview", href: "/dg", icon: ShieldCheck },
    { name: "BI & Analytics", href: "/dg/reports", icon: TrendingUp },
  ],
  regional: [
    { name: "Région Dashboard", href: "/regional", icon: LayoutDashboard },
    { name: "Performance Zones", href: "/regional/zones", icon: Map },
  ],
  chef_zone: [
    { name: "Zone Dashboard", href: "/chef-zone", icon: LayoutDashboard },
    { name: "Suivi Superviseurs", href: "/chef-zone/supervisors", icon: Users },
  ],
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const userRole = user?.role?.toLowerCase() || "superviseur";
  const currentMenu =
    MENU_CONFIG[userRole as keyof typeof MENU_CONFIG] ||
    MENU_CONFIG.superviseur;

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-zinc-950 flex flex-col transition-all duration-300 border-r border-zinc-800 z-50",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="h-24 flex items-center justify-between px-6 border-b border-zinc-900">
        {!isCollapsed && (
          <div className="w-full flex justify-center pt-2">
            <Image src="/logo.png" width={100} height={100} alt="Amir Logo" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:bg-amir-beige hover:text-white"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {currentMenu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group",
                isActive
                  ? "bg-amir-beige text-zinc-50 font-bold"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  isActive
                    ? "text-zinc-50"
                    : "text-zinc-500 group-hover:text-zinc-300",
                )}
              />
              {!isCollapsed && <span className="text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-900">
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-400 hover:bg-amir-red/80 hover:text-white h-10 px-3"
          onClick={() => logout()}
        >
          <LogOut size={20} className={cn(!isCollapsed && "mx-3")} />
          {!isCollapsed && <span className="text-sm">Quitter</span>}
        </Button>
      </div>
    </aside>
  );
}
