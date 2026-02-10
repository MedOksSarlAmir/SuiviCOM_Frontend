"use client";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { XCircle, LucideIcon } from "lucide-react";

interface FilterField {
  label: string;
  icon?: LucideIcon;
  render: React.ReactNode;
}

interface FilterBarProps {
  fields: FilterField[];
  onReset?: () => void;
  hasActiveFilters?: boolean;
}

export function FilterBar({
  fields,
  onReset,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-4">
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] items-end">
        {fields.map((field, idx) => (
          <div key={idx} className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold ml-1 flex items-center gap-1">
              {field.icon && <field.icon className="w-3 h-3" />} {field.label}
            </Label>
            {field.render}
          </div>
        ))}
        {hasActiveFilters && onReset && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-zinc-400 hover:text-red-500 h-9"
            >
              <XCircle className="w-4 h-4 mr-2" /> Réinitialiser
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
