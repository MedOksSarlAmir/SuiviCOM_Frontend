"use client";

import { useAuthStore } from "@/stores/authStore";

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 sticky top-0 z-10">
      <div className="pr-6">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900 leading-none mb-1">
            {user?.prenom} {user?.nom}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 pl-6 border-l border-gray-400 h-[60%]">
        <div className="text-left">
          <p className="text-[11px] text-amir-blue font-bold uppercase tracking-tighter">
            {user?.role}
          </p>
          <p className="text-[11px] text-amir-blue font-bold uppercase tracking-tighter">
            {user?.zone} - {user?.wilaya}
          </p>
        </div>
      </div>
    </header>
  );
}
