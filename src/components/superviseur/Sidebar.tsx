"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Target,
  Package,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Store,
  LogOut,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      name: "Vue d'ensemble",
      href: "/superviseur",
      icon: LayoutDashboard,
      roles: ["superviseur", "admin", "dg"],
    },
    {
      name: "Ventes Vendeurs",
      href: "/superviseur/sales",
      icon: ShoppingCart,
      roles: ["superviseur", "admin"],
    },
    {
      name: "Achats Distributeurs",
      href: "/superviseur/purchases",
      icon: CreditCard,
      roles: ["superviseur"],
    },
    {
      name: "Visites Terrain",
      href: "/superviseur/visits",
      icon: ClipboardCheck,
      roles: ["superviseur"],
    },
    {
      name: "Objectifs",
      href: "/superviseur/objectives",
      icon: Target,
      roles: ["superviseur", "chef_zone"],
    },
    {
      name: "Inventaire Produits",
      href: "/superviseur/inventory",
      icon: Package,
      roles: ["superviseur", "vendeur"],
    },
    {
      name: "Mes Vendeurs",
      href: "/superviseur/vendors",
      icon: Users,
      roles: ["superviseur"],
    },
    {
      name: "Rapports",
      href: "/superviseur/reports",
      icon: TrendingUp,
      roles: ["superviseur", "dg"],
    },
  ];

  const userRole = user?.role?.toLowerCase(); // Force lowercase for comparison

  const filteredItems = menuItems.filter(
    (item) =>
      userRole && item.roles.map((r) => r.toLowerCase()).includes(userRole),
  );

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-zinc-950 flex flex-col transition-all duration-300 border-r border-zinc-800 z-50",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Brand Header */}
      <div className="h-24 flex items-center justify-between px-6 border-b border-zinc-900">
        {!isCollapsed && (
          <div className="w-full flex justify-center pt-2">
            <Image src="/logo.png" width={100} height={100} alt="Amir Logo" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white hover:bg-zinc-900"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group",
                isActive
                  ? "bg-amir-beige text-zinc-50 shadow-lg shadow-amir-beige/10 font-bold" // Beige for active
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
          className="w-full justify-start text-zinc-400 hover:text-white hover:bg-amir-red/80 h-10 px-3 transition-colors" // Red for logout
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          <LogOut size={20} className={cn(!isCollapsed && "mx-3")} />
          {!isCollapsed && <span className="text-sm">Quitter</span>}
        </Button>
      </div>
    </aside>
  );
}
