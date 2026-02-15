"use client";
import React, { useEffect, useState } from "react";
import { useAdminUserStore } from "@/stores/admin/UserStore";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserModal } from "@/components/admin/users/UserModal";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationControl } from "@/components/ui/pagination-control";
import { FilterBar } from "@/components/shared/FilterBar";

export default function AdminUsersPage() {
  const { total, page, limit, fetchUsers, setPage, setFilters, filters } =
    useAdminUserStore();

  const [modal, setModal] = useState<{ open: boolean; user: any | null }>({
    open: false,
    user: null,
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const hasActiveFilters = filters.search !== "" || filters.role !== "all";

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50/30">
      <ModuleHeader
        title="Gestion des Accès"
        subtitle="Contrôle des privilèges et affectations géographiques."
        icon={ShieldCheck}
      />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters */}
          <FilterBar
            hasActiveFilters={hasActiveFilters}
            onReset={() => setFilters({ search: "", role: "all" })}
            fields={[
              {
                label: "Recherche",
                icon: Search,
                isActive: filters.search !== "",
                render: (
                  <Input
                    placeholder="Nom, username..."
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                    className="h-9 bg-zinc-50 border-none"
                  />
                ),
              },
              {
                label: "Rôle",
                icon: Filter,
                isActive: filters.role !== "all",
                render: (
                  <Select
                    value={filters.role}
                    onValueChange={(v) => setFilters({ role: v })}
                  >
                    <SelectTrigger className="h-9 bg-zinc-50 border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="superviseur">Superviseur</SelectItem>
                      <SelectItem value="chef_zone">Chef de Zone</SelectItem>
                      <SelectItem value="regional">Régional</SelectItem>
                    </SelectContent>
                  </Select>
                ),
              },
            ]}
          />

          {/* Table Card */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-zinc-700">Utilisateurs</h3>
              <Button
                onClick={() => {
                  setModal({ open: true, user: null });
                }}
                className="bg-amir-blue h-9"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Nouvel Accès
              </Button>
            </div>

            <UserTable onEdit={(u) => setModal({ open: true, user: u })} />

            <div className="p-4 border-t bg-zinc-50/50 rounded-b-xl">
              <PaginationControl
                total={total}
                page={page}
                limit={limit}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      </main>

      <UserModal
        user={modal.user}
        open={modal.open}
        onClose={() => setModal({ open: false, user: null })}
      />
    </div>
  );
}
