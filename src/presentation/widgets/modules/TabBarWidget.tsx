"use client";

import { useState } from "react";
import type { TabBarTabItem, TabBarWidgetProps } from "@/domain/widgets/types";

export function TabBarWidget({ data }: TabBarWidgetProps) {
  const tabs = (data.tabs as TabBarTabItem[]) ?? [
    { label: "Overview", active: true },
    { label: "Analytics" },
    { label: "Reports" },
    { label: "Team" },
  ];
  const [active, setActive] = useState(() => tabs.findIndex((tab) => tab.active) ?? 0);

  console.log(`Debug flow: TabBarWidget fired with`, {
    tabCount: tabs.length,
    activeIndex: active,
  });

  return (
    <div className="flex flex-col h-full gap-2" data-test-id="tab-bar-container">
      <div className="flex border-b border-slate-200" data-test-id="tab-bar-tabs">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActive(index)}
            className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
              index === active
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            data-test-id={`tab-bar-tab-${index}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-400" data-test-id="tab-bar-content">
        {tabs[active]?.label} content
      </div>
    </div>
  );
}
