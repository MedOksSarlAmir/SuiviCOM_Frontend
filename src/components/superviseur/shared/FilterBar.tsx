"use client";
import { Label } from "@/components/ui/label";
import { X, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterField {
  label: string;
  icon?: LucideIcon;
  render: React.ReactNode;
  isActive?: boolean;
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
    <div className="relative">
      {hasActiveFilters && onReset && (
        <button
          onClick={onReset}
          className="absolute -top-2.5 -right-2.5 z-30 bg-white text-red-500 border border-red-200 rounded-full p-1.5 shadow-md hover:bg-red-500 hover:text-white transition-all active:scale-90"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl p-4">
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] items-end">
          {fields.map((field, idx) => (
            <div key={idx} className="space-y-1.5 min-w-0">
              <Label
                className={cn(
                  "text-[10px] uppercase tracking-wider font-bold ml-1 flex items-center gap-1.5 truncate transition-colors",
                  field.isActive ? "text-blue-600" : "text-zinc-500",
                )}
              >
                {field.icon && (
                  <field.icon
                    className={cn(
                      "w-3 h-3 shrink-0",
                      field.isActive ? "text-blue-500" : "text-zinc-400",
                    )}
                  />
                )}
                {field.label}
              </Label>

              <div
                className={cn(
                  "relative h-9 rounded-lg border transition-all duration-200 overflow-hidden flex items-center",
                  field.isActive
                    ? "border-blue-500 bg-blue-50/30 ring-4 ring-blue-500/10"
                    : "border-zinc-200 bg-zinc-50 focus-within:border-zinc-400 focus-within:bg-white",
                )}
              >
                {/* 
                  The container below forces the rendered component (Input/Select) 
                  to fill the box exactly. 
                */}
                <div className="w-full h-full [&>*]:border-none [&>*]:ring-0 [&>*]:shadow-none [&>*]:w-full [&>*]:h-full [&>*]:bg-transparent [&>*]:px-3">
                  {field.render}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
