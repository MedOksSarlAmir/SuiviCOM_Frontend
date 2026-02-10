"use client";
import React, { useEffect, useState } from "react";
import { useAdminUserStore } from "@/stores/AdminUserStore";
import { ModuleHeader } from "@/components/superviseur/shared/ModuleHeader";
import { FilterBar } from "@/components/superviseur/shared/FilterBar";
import { PaginationControl } from "@/components/ui/pagination-control";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { UserModal } from "@/components/admin/users/UserModal";

export default function AdminUsersPage() {
  const {
    users,
    total,
    page,
    limit,
    filters,
    fetchUsers,
    setPage,
    setFilters,
    deleteUser,
    isLoading,
  } = useAdminUserStore();

  const [modal, setModal] = useState<{ open: boolean; user: any | null }>({
    open: false,
    user: null,
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50/30">
      <ModuleHeader
        title="Gestion Utilisateurs"
        subtitle="Contrôle des accès et périmètres géographiques (Régions, Zones, Wilayas)."
        icon={Shield}
      />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <FilterBar
            hasActiveFilters={filters.search !== "" || filters.role !== "all"}
            onReset={() => setFilters({ search: "", role: "all" })}
            fields={[
              {
                label: "Recherche",
                icon: Search,
                render: (
                  <Input
                    placeholder="Username, Nom..."
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                    className="h-9 bg-zinc-50"
                  />
                ),
              },
              {
                label: "Filtrer par Rôle",
                icon: Filter,
                render: (
                  <Select
                    value={filters.role}
                    onValueChange={(v) => setFilters({ role: v })}
                  >
                    <SelectTrigger className="h-9 bg-zinc-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="dg">Directeur Général</SelectItem>
                      <SelectItem value="dc">Directeur Commercial</SelectItem>
                      <SelectItem value="regional">Chef Région</SelectItem>
                      <SelectItem value="chef_zone">Chef Zone</SelectItem>
                      <SelectItem value="superviseur">Superviseur</SelectItem>
                    </SelectContent>
                  </Select>
                ),
              },
            ]}
          />

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <h3 className="font-bold text-zinc-700">
                Utilisateurs enregistrés ({total})
              </h3>
              <Button
                onClick={() => setModal({ open: true, user: null })}
                className="bg-amir-blue h-9"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Nouvel Utilisateur
              </Button>
            </div>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="animate-spin text-amir-blue" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-zinc-50">
                  <TableRow>
                    <TableHead className="pl-6">Identifiant</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Périmètre Géo</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-40 text-center text-zinc-400 italic"
                      >
                        Aucun utilisateur trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id} className="hover:bg-zinc-50/50">
                        <TableCell className="pl-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-800">
                              {u.username}
                            </span>
                            <span className="text-xs text-zinc-400">
                              {u.nom} {u.prenom}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="uppercase text-[10px] font-bold"
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500 font-medium">
                          {u.wilaya || u.zone || u.region || "National"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              u.active
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                                : "bg-zinc-100 text-zinc-400"
                            }
                          >
                            {u.active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setModal({ open: true, user: u })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Supprimer?")) deleteUser(u.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            <div className="p-4 border-t bg-zinc-50/50">
              <PaginationControl
                total={total}
                limit={limit}
                page={page}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      </main>

      {modal.open && (
        <UserModal
          user={modal.user}
          onClose={() => setModal({ open: false, user: null })}
        />
      )}
    </div>
  );
}
