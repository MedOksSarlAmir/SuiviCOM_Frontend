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

  // Sync input when page changes externally
  useEffect(() => {
    setInputPage(page.toString());
  }, [page]);

  const totalPages = Math.ceil(total / limit) || 1;
  const hasPrev = page > 1;
  // If backend doesn't send strict total, we might allow next if current page was full
  // But assuming total is roughly accurate or handled by parent:
  const hasNext = page < totalPages;

  const handleManualPageChange = (e: React.FormEvent) => {
    e.preventDefault();
    let p = parseInt(inputPage);
    if (isNaN(p)) p = 1;
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages; // Optional strict cap
    onPageChange(p);
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1",
        className,
      )}
    >
      {/* Items per page selector */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span>Afficher</span>
        {onLimitChange ? (
          <Select
            value={limit.toString()}
            onValueChange={(val) => onLimitChange(parseInt(val))}
          >
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

      {/* Navigation & Input */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500 mr-2">
          Total: <span className="font-medium text-zinc-900">{total}</span>
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-200"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Manual Page Input */}
        <form
          onSubmit={handleManualPageChange}
          className="flex items-center gap-1.5"
        >
          <Input
            className="h-8 w-12 text-center px-1 bg-white border-zinc-200 focus-visible:ring-amir-blue-hover"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onBlur={handleManualPageChange}
          />
        </form>

        <Button
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
