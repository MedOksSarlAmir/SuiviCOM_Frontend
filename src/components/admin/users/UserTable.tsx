"use client";
import React from "react";
import { useAdminUserStore } from "@/stores/admin/UserStore";
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
import {
  Edit,
  Trash2,
  Loader2,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";

export function UserTable({ onEdit }: { onEdit: (user: any) => void }) {
  const { users, isLoading, deleteUser } = useAdminUserStore();

  if (isLoading)
    return (
      <div className="h-96 flex flex-col items-center justify-center text-zinc-400">
        <Loader2 className="animate-spin w-10 h-10 mb-4 text-amir-blue" />
        <span className="text-xs font-black uppercase tracking-[0.2em]">
          Synchronisation...
        </span>
      </div>
    );

  return (
    <Table>
      <TableHeader className="bg-zinc-50/50">
        <TableRow>
          <TableHead className="pl-8 h-14">Collaborateur</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Affectation Géo</TableHead>
          <TableHead>Distributeurs</TableHead>
          <TableHead className="text-right pr-8">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => (
          <TableRow
            key={u.id}
            className="hover:bg-zinc-50 transition-colors group"
          >
            <TableCell className="pl-8 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-amir-blue group-hover:text-white transition-all shadow-sm">
                  <UserIcon size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-zinc-900 text-sm leading-none mb-1.5">
                    {u.username}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">
                    {u.first_name} {u.last_name}
                  </span>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <Badge
                variant="outline"
                className="font-black uppercase text-[9px] bg-white border-zinc-200 px-2 py-0.5"
              >
                <ShieldCheck className="w-3 h-3 mr-1 text-amir-blue" /> {u.role}
              </Badge>
            </TableCell>

            <TableCell className="text-[11px] font-bold text-zinc-500">
              {u.role === "superviseur" ? (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {u.wilayas?.map((w: any) => (
                    <span
                      key={w.id}
                      className="bg-zinc-100 px-1.5 py-0.5 rounded text-[9px] font-bold"
                    >
                      {w.name}
                    </span>
                  ))}
                </div>
              ) : (
                u.zone ||
                u.region || (
                  <span className="text-zinc-300 italic font-normal">
                    National
                  </span>
                )
              )}
            </TableCell>

            <TableCell>
              <div className="flex flex-wrap gap-1">
                {u.managed_distributors?.map((d: string) => (
                  <Badge
                    key={d}
                    className="bg-amir-blue/10 text-amir-blue border-none text-[9px] font-black uppercase"
                  >
                    {d}
                  </Badge>
                ))}
              </div>
            </TableCell>

            <TableCell className="text-right pr-8">
              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-zinc-400 hover:text-amir-blue hover:bg-amir-blue/5 rounded-full"
                  onClick={() => onEdit(u)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-full"
                  onClick={() => {
                    if (confirm("Supprimer ce compte ?")) deleteUser(u.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
