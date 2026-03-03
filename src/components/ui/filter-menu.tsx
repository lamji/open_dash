"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface FilterItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface FilterMenuProps {
  label?: string;
  filters: FilterItem[];
  onFilterChange: (id: string, checked: boolean) => void;
  testId?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

function FilterMenu({
  label = "Filters",
  filters,
  onFilterChange,
  testId = "filter-menu",
  className,
  triggerClassName,
  contentClassName,
}: FilterMenuProps) {
  const activeCount = filters.filter((f) => f.checked).length;

  return (
    <div className={cn("relative inline-flex", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="default"
            data-test-id={`${testId}-filter-btn`}
            className={cn(
              "gap-2 text-sm font-medium",
              activeCount > 0 && "border-primary/40 bg-primary/5",
              triggerClassName
            )}
          >
            <Filter className="size-4" />
            {label}
            {activeCount > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn("w-56", contentClassName)}
          align="start"
        >
          <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filters.map((filter) => (
            <DropdownMenuCheckboxItem
              key={filter.id}
              checked={filter.checked}
              onCheckedChange={(checked) =>
                onFilterChange(filter.id, checked === true)
              }
              data-test-id={`${testId}-filter-${filter.id}`}
            >
              {filter.label}
            </DropdownMenuCheckboxItem>
          ))}
          {activeCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <Button
                variant="ghost"
                size="sm"
                data-test-id={`${testId}-clear-all`}
                onClick={() => {
                  filters.forEach((f) => {
                    if (f.checked) onFilterChange(f.id, false);
                  });
                }}
                className="h-8 w-full justify-center text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export { FilterMenu };
