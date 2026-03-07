"use client";

import { useState, type ReactElement } from "react";
import { BarChart3, Bell, ChevronRight, LayoutDashboard, Star, Users } from "lucide-react";
import type { SidebarNavItem, SidebarNavWidgetProps } from "@/domain/widgets/types";

export function SidebarNavWidget({ data }: SidebarNavWidgetProps) {
  const items = (data.items as SidebarNavItem[]) ?? [
    { icon: "LayoutDashboard", label: "Dashboard", active: true },
    { icon: "BarChart2", label: "Analytics" },
    { icon: "Users", label: "Users", badge: "3" },
    { icon: "Settings", label: "Settings" },
    { icon: "HelpCircle", label: "Help" },
  ];
  const [activeIdx, setActiveIdx] = useState(() => items.findIndex((item) => item.active) ?? 0);
  const iconMap: Record<string, ReactElement> = {
    LayoutDashboard: <LayoutDashboard className="w-3.5 h-3.5" />,
    BarChart2: <BarChart3 className="w-3.5 h-3.5" />,
    Users: <Users className="w-3.5 h-3.5" />,
    Settings: <Star className="w-3.5 h-3.5" />,
    HelpCircle: <Bell className="w-3.5 h-3.5" />,
  };

  console.log(`Debug flow: SidebarNavWidget fired with`, {
    itemCount: items.length,
    activeIdx,
  });

  return (
    <div className="flex flex-col h-full gap-0.5" data-test-id="sidebar-nav-container">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => setActiveIdx(index)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left ${
            index === activeIdx ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
          }`}
          data-test-id={`sidebar-nav-item-${index}`}
        >
          <div className="flex items-center gap-2.5" data-test-id={`sidebar-nav-content-${index}`}>
            <span data-test-id={`sidebar-nav-icon-${index}`}>
              {iconMap[item.icon] ?? <Star className="w-3.5 h-3.5" />}
            </span>
            <span className="text-xs font-medium" data-test-id={`sidebar-nav-label-${index}`}>
              {item.label}
            </span>
          </div>
          <div className="flex items-center gap-1" data-test-id={`sidebar-nav-right-${index}`}>
            {item.badge && (
              <span
                className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded-full font-bold"
                data-test-id={`sidebar-nav-badge-${index}`}
              >
                {item.badge}
              </span>
            )}
            {index === activeIdx && (
              <ChevronRight className="w-3 h-3" data-test-id={`sidebar-nav-chevron-${index}`} />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
