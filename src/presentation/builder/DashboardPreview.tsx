"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import {
  LayoutGrid, LayoutDashboard, BarChart3, Blocks,
  Pencil, Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LayoutBlock, LayoutSlot } from "@/domain/builder/types";
import { WIDGET_PREVIEWS } from "@/presentation/widgets";
import { useDashboardPreview } from "./useDashboardPreview";

const GRID_CLASS: Record<string, string> = {
  single:   "grid-cols-1",
  "grid-2": "grid-cols-1 md:grid-cols-2",
  "grid-3": "grid-cols-1 md:grid-cols-3",
  "grid-4": "grid-cols-2 md:grid-cols-4",
};

interface Props {
  id: string;
}

function cssStringToStyle(css: string): CSSProperties {
  console.log(`Debug flow: preview cssStringToStyle fired with`, { cssLength: css.length });
  const style: Record<string, string> = {};
  css
    .split(";")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((decl) => {
      const idx = decl.indexOf(":");
      if (idx < 0) return;
      const prop = decl.slice(0, idx).trim();
      const val = decl.slice(idx + 1).trim();
      if (!prop || !val) return;
      const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      style[camel] = val;
    });
  console.log(`Debug flow: preview cssStringToStyle result`, { keys: Object.keys(style) });
  return style as CSSProperties;
}

function getPreviewBlockStyle(block: LayoutBlock): CSSProperties {
  console.log(`Debug flow: getPreviewBlockStyle fired with`, { blockId: block.id, display: block.layoutDisplay });
  const gap = block.gap ? `${block.gap}` : undefined;
  if (block.layoutDisplay === "flex") {
    return {
      display: "flex",
      flexDirection: block.slots.length > 1 ? "row" : "column",
      gap,
      justifyContent: block.justifyContent,
      alignItems: block.alignItems,
    };
  }
  return {
    gap,
    alignItems: block.alignItems,
    ...(block.gridRatio ? { gridTemplateColumns: block.gridRatio } : {}),
  };
}

function getPreviewBlockClass(block: LayoutBlock): string {
  console.log(`Debug flow: getPreviewBlockClass fired with`, { blockId: block.id, display: block.layoutDisplay });
  if (block.layoutDisplay === "flex") {
    return "flex";
  }
  return `grid ${block.gridRatio ? "" : GRID_CLASS[block.type] ?? "grid-cols-1"}`;
}

export default function DashboardPreview({ id }: Props) {
  const { record, loading, error } = useDashboardPreview(id);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50" data-test-id="preview-loading">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" data-test-id="preview-loading-icon" />
          <p className="text-sm text-slate-500" data-test-id="preview-loading-text">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50" data-test-id="preview-error">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-400" data-test-id="preview-error-icon" />
          <p className="font-semibold text-slate-800" data-test-id="preview-error-title">Dashboard not found</p>
          <p className="text-sm text-slate-500" data-test-id="preview-error-msg">{error ?? "This layout could not be loaded."}</p>
          <Link href="/builder" data-test-id="preview-back-btn">
            <Button variant="outline">← Back to Builder</Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderPreviewSlot = (
    block: LayoutBlock,
    slot: LayoutSlot,
    slotIdx: number,
    depth: number,
    blockStyle: CSSProperties,
  ) => {
    console.log(`Debug flow: renderPreviewSlot fired with`, { blockId: block.id, slotIdx, depth, hasWidget: !!slot.widget, childCount: slot.childBlocks?.length ?? 0 });
    const widget = slot.widget;
    const childBlocks = slot.childBlocks ?? [];
    const hasChildren = childBlocks.length > 0;
    const isNestedSlot = depth > 0;
    const slotStyle = cssStringToStyle(block.columnStyles?.[slotIdx] ?? "");
    const slotHasHeightOverride = slotStyle.height !== undefined || slotStyle.minHeight !== undefined;
    const blockHasHeightOverride = blockStyle.height !== undefined || blockStyle.minHeight !== undefined;
    const hasHeightConstraint = slotHasHeightOverride || blockHasHeightOverride;
    const shouldApplyDefaultSlotMinHeight = !isNestedSlot && !slotHasHeightOverride && !blockHasHeightOverride;
    const slotBaseStyle: CSSProperties = {
      ...(!isNestedSlot ? { alignSelf: "stretch" } : {}),
      ...(shouldApplyDefaultSlotMinHeight ? { minHeight: "160px" } : {}),
      ...(isNestedSlot && !slotHasHeightOverride ? { minHeight: "0px" } : {}),
      ...(hasChildren
        ? {
            display: "flex",
            flexDirection: "column",
            ...(hasHeightConstraint ? { overflow: "auto" } : {}),
          }
        : {}),
    };
    return (
      <div
        key={slotIdx}
        className={`rounded-xl border p-4 ${hasChildren ? "border-slate-300 bg-slate-100" : "border-slate-200 bg-white"}`}
        style={{ ...slotBaseStyle, ...slotStyle }}
        data-test-id={`preview-slot-${block.id}-${slotIdx}`}
      >
        {widget ? (
          <div data-test-id={`preview-widget-${block.id}-${slotIdx}`}>
            {WIDGET_PREVIEWS[widget.widgetId]
              ? WIDGET_PREVIEWS[widget.widgetId](widget.widgetData)
              : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs" data-test-id={`preview-widget-missing-${block.id}-${slotIdx}`}>
                  Widget &ldquo;{widget.widgetId}&rdquo; not found
                </div>
              )
            }
          </div>
        ) : childBlocks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-300 text-xs" data-test-id={`preview-slot-empty-${block.id}-${slotIdx}`}>
            Empty slot
          </div>
        ) : null}

        {hasChildren && (
          <div className={`${widget ? "mt-4" : ""} flex min-h-0 flex-col gap-3 ${hasHeightConstraint ? "h-full" : ""}`} data-test-id={`preview-slot-children-${block.id}-${slotIdx}`}>
            <div className="rounded-xl bg-slate-200/80 p-3 flex-1 min-h-0">
              <div className="space-y-3 min-h-0">
                {childBlocks.map((childBlock) => renderPreviewBlock(childBlock, depth + 1))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPreviewBlock = (block: LayoutBlock, depth = 0) => {
    console.log(`Debug flow: renderPreviewBlock fired with`, { blockId: block.id, depth });
    const blockStyle = cssStringToStyle(block.blockStyles ?? "");
    return (
      <div key={block.id} style={blockStyle} data-test-id={`preview-block-wrapper-${block.id}`}>
        <div
          className={getPreviewBlockClass(block)}
          style={getPreviewBlockStyle(block)}
          data-test-id={`preview-block-${block.id}`}
        >
          {block.slots.map((slot, slotIdx) => renderPreviewSlot(block, slot, slotIdx, depth, blockStyle))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50" data-test-id="preview-shell">

      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden" data-test-id="preview-sidebar">
        <div className="px-4 py-4 border-b border-slate-100" data-test-id="preview-sidebar-brand">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <LayoutGrid className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">OpenDash</span>
          </div>
        </div>

        <nav className="px-3 py-3 space-y-0.5 flex-1" data-test-id="preview-sidebar-nav">
          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" data-test-id="preview-nav-dashboard">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link href="/builder" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" data-test-id="preview-nav-builder">
            <Blocks className="w-4 h-4" />
            <span className="text-sm font-medium">Builder ←</span>
          </Link>
          <Link href="/widgets" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors" data-test-id="preview-nav-widgets">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Widgets</span>
          </Link>
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" data-test-id="preview-main">

        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between" data-test-id="preview-header">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-slate-800 text-sm" data-test-id="preview-title">{record.name}</h1>
          </div>
          <Link href="/builder" data-test-id="preview-edit-link">
            <Button size="sm" variant="outline" data-test-id="preview-edit-btn">
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
          </Link>
        </div>

        {/* Dashboard content */}
        <div className="flex-1 overflow-auto px-6 py-6" data-test-id="preview-canvas">
          {record.layout.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" data-test-id="preview-empty">
              <LayoutGrid className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500 text-sm" data-test-id="preview-empty-msg">This dashboard has no blocks.</p>
              <Link href="/builder" className="mt-4" data-test-id="preview-empty-back">
                <Button variant="outline" size="sm">← Back to Builder</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 max-w-6xl" data-test-id="preview-blocks">
              {record.layout.map((block) => renderPreviewBlock(block))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
