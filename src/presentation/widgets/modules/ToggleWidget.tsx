"use client";

import type { ToggleWidgetProps } from "@/domain/widgets/types";

export function ToggleWidget({ data }: ToggleWidgetProps) {
  const options = (data.options as string[]) ?? ["List", "Grid", "Kanban"];
  const selected = (data.selected as string) ?? options[0];

  console.log(`Debug flow: ToggleWidget fired with`, {
    optionCount: options.length,
    selected,
  });

  return (
    <div className="flex flex-col h-full justify-center gap-3" data-test-id="toggle-button-group-container">
      <p className="text-xs text-slate-500" data-test-id="toggle-button-group-label">View Mode</p>
      <div
        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3"
        data-test-id="toggle-button-group-bar"
      >
        <div
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          data-test-id="toggle-button-group-active"
        >
          {selected}
        </div>
        <p className="mt-2 text-[11px] text-slate-500" data-test-id="toggle-button-group-meta">
          {options.length} layout modes available
        </p>
      </div>
    </div>
  );
}
