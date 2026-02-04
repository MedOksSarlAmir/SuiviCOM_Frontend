"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  className?: string;
}

export function PaginationControl({
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  className,
}: PaginationProps) {
  const [inputPage, setInputPage] = useState(page.toString());

  useEffect(() => {
    setInputPage(page.toString());
  }, [page]);

  const totalPages = Math.ceil(total / limit) || 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Logic moved to a reusable function
  const triggerPageChange = () => {
    let p = parseInt(inputPage);
    if (isNaN(p)) p = 1;
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    onPageChange(p);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Stop the outer form from submitting!
      triggerPageChange();
    }
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1", className)}>
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span>Afficher</span>
        {onLimitChange ? (
          <Select value={limit.toString()} onValueChange={(val) => onLimitChange(parseInt(val))}>
            <SelectTrigger className="h-8 w-[70px] bg-white border-zinc-200">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className="font-medium">{limit}</span>
        )}
        <span>lignes / page</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500 mr-2">
          Total: <span className="font-medium text-zinc-900">{total}</span>
        </span>

        <Button
          type="button" // Always specify type="button" inside other forms
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-200"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* FIX: Changed from <form> to <div> */}
        <div className="flex items-center gap-1.5">
          <Input
            className="h-8 w-12 text-center px-1 bg-white border-zinc-200"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onBlur={triggerPageChange}
            onKeyDown={handleKeyDown} // Trigger on Enter
          />
        </div>

        <Button
          type="button" // Always specify type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-200"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <span className="text-sm text-zinc-500">sur {totalPages}</span>
      </div>
    </div>
  );
}