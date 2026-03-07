"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { SelectWidgetOption, SelectWidgetProps } from "@/domain/widgets/types";

export function SelectWidget({ data }: SelectWidgetProps) {
  const label = (data.label as string) ?? "Select Status";
  const options = (data.options as SelectWidgetOption[]) ?? [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
    { value: "archived", label: "Archived" },
  ];
  const [selected, setSelected] = useState((data.selected as string) ?? "active");
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === selected)?.label ?? selected;

  console.log(`Debug flow: SelectWidget fired with`, {
    label,
    optionCount: options.length,
    selected,
    open,
  });

  return (
    <div className="flex flex-col h-full gap-2" data-test-id="single-select-container">
      <label className="text-xs font-medium text-slate-700" data-test-id="single-select-label">{label}</label>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer"
        data-test-id="single-select-trigger"
      >
        <span className="text-sm text-slate-700" data-test-id="single-select-value">{selectedLabel}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" data-test-id="single-select-arrow" />
      </button>
      {open && (
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm" data-test-id="single-select-options">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                setSelected(option.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between ${
                option.value === selected
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
              data-test-id={`single-select-option-${index}`}
            >
              <span data-test-id={`single-select-option-label-${index}`}>{option.label}</span>
              {option.value === selected && <Check className="w-3 h-3" data-test-id={`single-select-check-${index}`} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
