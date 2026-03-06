"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, X, LayoutGrid, Save, Eye, EyeOff,
  Loader2, ChevronRight, Pencil, Sparkles, Send,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useBuilder, BUILDER_CATEGORIES } from "./useBuilder";
import { WIDGET_PREVIEWS, WIDGET_CATEGORIES } from "@/presentation/widgets";
import type { LayoutBlock, LayoutSlot, LayoutType, CodeEditorTab } from "@/domain/builder/types";
import type { WidgetTemplate } from "@/domain/widgets/types";
import { DASHBOARD_TEMPLATES } from "@/lib/dashboard-templates";
import { WidgetPickerCard } from "@/components/widgets/widget-picker-card";
import type { WidgetTemplate as WidgetTemplateWithDates } from "@/presentation/widgets/useWidgets";

const LAYOUT_OPTIONS: { type: LayoutType; label: string; cols: number }[] = [
  { type: "single",  label: "Single Column", cols: 1 },
  { type: "grid-2",  label: "2-Column Grid",  cols: 2 },
  { type: "grid-3",  label: "3-Column Grid",  cols: 3 },
  { type: "grid-4",  label: "4-Column Grid",  cols: 4 },
];

function LayoutVisual({ cols }: { cols: number }) {
  return (
    <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-10 border border-slate-300 rounded" />
      ))}
    </div>
  );
}

function TemplateSkeleton({ templateId }: { templateId: string }) {
  console.log(`Debug flow: TemplateSkeleton fired with`, { templateId });
  
  switch (templateId) {
    case "metrics-overview":
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 border-2 border-slate-300 rounded bg-slate-50" />
            ))}
          </div>
          <div className="h-12 border-2 border-slate-300 rounded bg-slate-50" />
        </div>
      );
    
    case "split-dashboard":
      return (
        <div className="flex gap-2">
          <div className="w-1/4 space-y-1">
            <div className="h-6 border-2 border-slate-300 rounded bg-slate-50" />
            <div className="h-6 border-2 border-slate-300 rounded bg-slate-50" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-8 border-2 border-slate-300 rounded bg-slate-50" />
            <div className="h-5 border-2 border-slate-300 rounded bg-slate-50" />
          </div>
        </div>
      );
    
    case "grid-dashboard":
      return (
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 border-2 border-slate-300 rounded bg-slate-50" />
          ))}
        </div>
      );
    
    case "analytics-dashboard":
      return (
        <div className="space-y-2">
          <div className="h-12 border-2 border-slate-300 rounded bg-slate-50" />
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 border-2 border-slate-300 rounded bg-slate-50" />
            ))}
          </div>
        </div>
      );
    
    case "monitoring-dashboard":
      return (
        <div className="space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 border-2 border-slate-300 rounded bg-slate-50" />
          ))}
        </div>
      );
    
    case "kpi-dashboard":
      return (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-8 border-2 border-slate-300 rounded bg-slate-50" />
              <div className="h-4 border-2 border-slate-300 rounded bg-slate-50" />
            </div>
          ))}
        </div>
      );
    
    default:
      return (
        <div className="h-16 border-2 border-slate-300 rounded bg-slate-50 flex items-center justify-center text-xs text-slate-400">
          Template Preview
        </div>
      );
  }
}

const SIDEBAR_CATEGORIES = WIDGET_CATEGORIES.filter((c) =>
  (BUILDER_CATEGORIES as readonly string[]).includes(c.id)
);

function cssStringToStyle(css: string): CSSProperties {
  console.log(`Debug flow: cssStringToStyle fired with`, { cssLen: css?.length });
  if (!css || !css.trim()) return {};
  const style: Record<string, string> = {};
  const normalized = css
    .replace(/,\s*\n\s*/g, "; ")
    .replace(/\n\s*/g, "; ")
    .replace(/\r/g, "");
  normalized.split(";").forEach((decl) => {
    const colonIdx = decl.indexOf(":");
    if (colonIdx === -1) return;
    const prop = decl.slice(0, colonIdx).trim();
    const val = decl.slice(colonIdx + 1).trim();
    if (!prop || !val) return;
    const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    style[camel] = val;
  });
  console.log(`Debug flow: cssStringToStyle result`, { keys: Object.keys(style) });
  return style as CSSProperties;
}

const GRID_CLASS: Record<string, string> = {
  single:   "grid-cols-1",
  "grid-2": "grid-cols-2",
  "grid-3": "grid-cols-3",
  "grid-4": "grid-cols-4",
};

const JUSTIFY_OPTIONS = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
  { value: "between", label: "Space Between" },
  { value: "around", label: "Space Around" },
  { value: "evenly", label: "Space Evenly" },
] as const;

const ALIGN_OPTIONS = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
  { value: "stretch", label: "Stretch" },
  { value: "baseline", label: "Baseline" },
] as const;

const COLUMN_CSS_DRAFT_DEFAULT = [
  "position: relative;",
  "width: 100%;",
  "min-height: 300px;",
  "height: auto;",
  "background: transparent;",
  "padding: 0px;",
  "margin: 0px;",
  "border-radius: 12px;",
  "border: none;",
  "box-shadow: none;",
  "display: block;",
  "overflow: visible;",
].join("\n");

const BLOCK_CSS_DRAFT_DEFAULT = [
  "background: transparent;",
  "padding: 0px;",
  "margin: 0px;",
  "border-radius: 0px;",
  "border: none;",
  "box-shadow: none;",
  "overflow: visible;",
].join("\n");

function getCssEditorSeed(isBlockLevel: boolean, css: string): string {
  console.log(`Debug flow: getCssEditorSeed fired with`, { isBlockLevel, cssLength: css.length });
  if (css.trim().length > 0) {
    return css;
  }
  return isBlockLevel ? BLOCK_CSS_DRAFT_DEFAULT : COLUMN_CSS_DRAFT_DEFAULT;
}

function findBlock(blocks: LayoutBlock[], blockId: string): LayoutBlock | null {
  console.log(`Debug flow: findBlock fired with`, { blockId, blockCount: blocks.length });
  for (const block of blocks) {
    if (block.id === blockId) {
      return block;
    }
    for (const slot of block.slots) {
      const found = findBlock(slot.childBlocks ?? [], blockId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function getBlockContainerStyle(block: LayoutBlock): CSSProperties {
  console.log(`Debug flow: getBlockContainerStyle fired with`, { blockId: block.id, display: block.layoutDisplay, gap: block.gap });
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
    justifyItems: block.justifyContent === "start" ? "start" : block.justifyContent === "end" ? "end" : undefined,
    alignItems: block.alignItems,
    ...(block.gridRatio ? { gridTemplateColumns: "repeat(12, minmax(0, 1fr))" } : {}),
  };
}

function parseGridRatioSpans(block: LayoutBlock): number[] {
  console.log(`Debug flow: parseGridRatioSpans fired with`, { blockId: block.id, gridRatio: block.gridRatio });
  if (!block.gridRatio) return [];
  const parts = block.gridRatio
    .split(" ")
    .map((part) => Number.parseFloat(part.trim().replace("fr", "")))
    .filter((part) => Number.isFinite(part) && part > 0);
  if (parts.length <= block.slots.length) {
    return parts;
  }
  return [...parts.slice(0, Math.max(block.slots.length - 1, 0)), parts[parts.length - 1]];
}

function getSlotPlacementStyle(block: LayoutBlock, slotIdx: number): CSSProperties {
  const spans = parseGridRatioSpans(block);
  console.log(`Debug flow: getSlotPlacementStyle fired with`, { blockId: block.id, slotIdx, spans });
  if (!block.gridRatio || block.layoutDisplay !== "grid" || spans.length !== block.slots.length) {
    return {};
  }

  const span = spans[slotIdx] ?? 1;
  const totalSpan = spans.reduce((sum, current) => sum + current, 0);
  const freeColumns = Math.max(12 - totalSpan, 0);
  const blockOffset =
    block.justifyContent === "end"
      ? freeColumns
      : block.justifyContent === "center"
        ? Math.floor(freeColumns / 2)
        : 0;
  const start = spans.slice(0, slotIdx).reduce((sum, current) => sum + current, 1 + blockOffset);
  return { gridColumn: `${start} / span ${span}` };
}

function getBlockContainerClass(block: LayoutBlock): string {
  console.log(`Debug flow: getBlockContainerClass fired with`, { blockId: block.id, display: block.layoutDisplay });
  if (block.layoutDisplay === "flex") {
    return "flex";
  }
  return `grid ${block.gridRatio ? "" : GRID_CLASS[block.type] ?? "grid-cols-1"}`;
}

export default function BuilderShell() {
  const router = useRouter();
  const {
    blocks,
    navItems,
    navItemModalOpen,
    addingNavItem,
    loadingNavItems,
    widgetCategoryModalOpen,
    showLayoutPicker,
    showWidgetTypePicker,
    showWidgetVariantPicker,
    widgetTemplates,
    loadingTemplates,
    variantTemplates,
    previewMode,
    savingLayout,
    projectId,
    cssEditorState,
    codeEditorTab,
    dataEditorDraft,
    functionEditorDraft,
    setCodeEditorTab,
    setDataEditorDraft,
    setFunctionEditorDraft,
    groqChatOpen,
    groqChatContext,
    groqMessages,
    groqChatLoading,
    layoutId,
    setLayoutId,
    dataJsonError,
    setDataJsonError,
    togglePreview,
    saveLayout,
    openLayoutPicker,
    openSlotLayoutPicker,
    closeLayoutPicker,
    addBlock,
    removeBlock,
    openWidgetVariantPicker,
    closeWidgetVariantPicker,
    placeWidget,
    removeWidget,
    openNavItemModal,
    closeNavItemModal,
    addNavItem,
    removeNavItem,
    openWidgetCategoryModal,
    closeWidgetCategoryModal,
    openCssEditor,
    closeCssEditor,
    saveCssStyles,
    saveWidgetDataFromEditor,
    saveWidgetFunctionFromEditor,
    openGroqChat,
    closeGroqChat,
    sendGroqMessage,
    applyTemplate,
    generateAiWidget,
    gridRatioModal,
    openGridRatioModal,
    closeGridRatioModal,
    saveGridRatio,
  } = useBuilder();

  const [selectedSlot, setSelectedSlot] = useState<{ blockId: string; slotIdx: number } | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [dashboardName, setDashboardName] = useState("My Dashboard");
  const [navItemLabel, setNavItemLabel] = useState("");
  const [cssEditorDraft, setCssEditorDraft] = useState("");
  const [groqInput, setGroqInput] = useState("");
  const [aiWidgetPrompts, setAiWidgetPrompts] = useState<Record<string, string>>({});
  const [aiWidgetLoading, setAiWidgetLoading] = useState<string | null>(null);
  const [gridRatioInput, setGridRatioInput] = useState("");
  const [gridRatioError, setGridRatioError] = useState("");
  const [gridDisplayInput, setGridDisplayInput] = useState<"grid" | "flex">("grid");
  const [gridJustifyInput, setGridJustifyInput] = useState("start");
  const [gridAlignInput, setGridAlignInput] = useState("stretch");
  const [gridGapInput, setGridGapInput] = useState("16px");
  const [aiPromptModal, setAiPromptModal] = useState<{ blockId: string; slotIdx: number } | null>(null);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuHighlighted, setSlashMenuHighlighted] = useState(0);
  const [slotWidths, setSlotWidths] = useState<Record<string, number>>({});
  const groqInputRef = useRef<HTMLInputElement>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    console.log(`Debug flow: groqChatOpen changed`, { groqChatOpen, groqChatLoading });
    if (groqChatOpen && !groqChatLoading) {
      setTimeout(() => groqInputRef.current?.focus(), 0);
    }
  }, [groqChatOpen, groqChatLoading, groqMessages]);

  useEffect(() => {
    console.log(`Debug flow: slot width observer effect fired with`, { blockCount: blocks.length });
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      setSlotWidths((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const slotKey = target.dataset.slotKey;
          if (!slotKey) {
            continue;
          }
          const width = Math.round(entry.contentRect.width);
          if (next[slotKey] !== width) {
            next[slotKey] = width;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    });

    for (const [slotKey, node] of Object.entries(slotRefs.current)) {
      if (!node) continue;
      node.dataset.slotKey = slotKey;
      observer.observe(node);
    }

    return () => {
      observer.disconnect();
    };
  }, [blocks, previewMode]);

  const handleAddWidget = (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: handleAddWidget fired with`, { blockId, slotIdx });
    setSelectedSlot({ blockId, slotIdx });
    openWidgetCategoryModal();
  };

  const openCssEditorWithDraft = (block: LayoutBlock, slotIdx?: number) => {
    const isBlockLevel = slotIdx === undefined || slotIdx === -1;
    const editorState = openCssEditor(block.id, slotIdx);
    if (!editorState) return;
    const editableSeed = getCssEditorSeed(isBlockLevel, editorState.css ?? "");
    console.log(`Debug flow: openCssEditorWithDraft fired with`, {
      blockId: block.id,
      slotIdx,
      isBlockLevel,
      cssLength: editorState.css.length,
      editableSeedLength: editableSeed.length,
    });
    setCssEditorDraft(editableSeed);
  };

  const handleAddLayout = (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: handleAddLayout fired with`, { blockId, slotIdx });
    openSlotLayoutPicker(blockId, slotIdx);
  };

  const handleOpenGridRatioModal = (block: LayoutBlock) => {
    console.log(`Debug flow: handleOpenGridRatioModal fired with`, { blockId: block.id });
    const editableRatio = (() => {
      if (!block.gridRatio) return "";
      const parts = block.gridRatio
        .split(" ")
        .map((part) => part.trim().replace("fr", ""))
        .filter((part) => part.length > 0);
      if (parts.length <= block.slots.length) {
        return parts.join("/");
      }
      const normalizedParts = [...parts.slice(0, Math.max(block.slots.length - 1, 0)), parts[parts.length - 1]];
      return normalizedParts.join("/");
    })();
    setGridRatioInput(editableRatio);
    setGridDisplayInput(block.layoutDisplay ?? "grid");
    setGridJustifyInput(block.justifyContent ?? "start");
    setGridAlignInput(block.alignItems ?? "stretch");
    setGridGapInput(block.gap ?? "16px");
    setGridRatioError("");
    openGridRatioModal(block.id);
  };

  const handleGenerateAiWidget = async (blockId: string, slotIdx: number) => {
    const key = `${blockId}-${slotIdx}`;
    const prompt = aiWidgetPrompts[key]?.trim();
    console.log(`Debug flow: handleGenerateAiWidget fired with`, { blockId, slotIdx, prompt });
    if (!prompt) return;
    setAiWidgetLoading(key);
    const result = await generateAiWidget(blockId, slotIdx, prompt);
    console.log(`Debug flow: handleGenerateAiWidget result`, { ok: result.ok, error: result.error });
    setAiWidgetLoading(null);
    if (result.ok) {
      setAiWidgetPrompts((prev) => { const next = { ...prev }; delete next[key]; return next; });
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (!selectedSlot) return;
    closeWidgetCategoryModal();
    openWidgetVariantPicker(selectedSlot.blockId, selectedSlot.slotIdx, categoryId);
  };

  const handleSave = async () => {
    const id = await saveLayout(dashboardName);
    if (id) {
      setSaveDialogOpen(false);
      router.push(`/preview/${id}`);
    }
  };

  const handleAddNavItem = async () => {
    if (!navItemLabel.trim()) return;
    const ok = await addNavItem(navItemLabel);
    if (ok) {
      setNavItemLabel("");
      closeNavItemModal();
    }
  };

  const renderSlotContent = (
    block: LayoutBlock,
    slot: LayoutSlot,
    slotIdx: number,
    depth: number,
    blockStyle: CSSProperties,
  ) => {
    console.log(`Debug flow: renderSlotContent fired with`, { blockId: block.id, slotIdx, depth, hasWidget: !!slot.widget, childCount: slot.childBlocks?.length ?? 0 });
    const widget = slot.widget;
    const childBlocks = slot.childBlocks ?? [];
    const rawSlotCss = block.columnStyles?.[slotIdx];
    const slotStyle = cssStringToStyle(rawSlotCss ?? "");
    const slotPlacementStyle = getSlotPlacementStyle(block, slotIdx);
    const hasCustomStyle = Object.keys(slotStyle).length > 0;
    const hasChildren = childBlocks.length > 0;
    const slotKey = `${block.id}-${slotIdx}`;
    const measuredSlotWidth = slotWidths[slotKey] ?? 9999;
    const isNestedSlot = depth > 0;
    const isCompactSlot = measuredSlotWidth <= 240 || (isNestedSlot && measuredSlotWidth <= 300);
    const hasExplicitSlotStyleEntry =
      Array.isArray(block.columnStyles) &&
      Object.prototype.hasOwnProperty.call(block.columnStyles, slotIdx);
    const slotHasHeightOverride = slotStyle.height !== undefined || slotStyle.minHeight !== undefined;
    const blockHasHeightOverride = blockStyle.height !== undefined || blockStyle.minHeight !== undefined;
    const hasHeightConstraint = slotHasHeightOverride || blockHasHeightOverride;
    const shouldApplyDefaultSlotMinHeight =
      !isNestedSlot &&
      !hasExplicitSlotStyleEntry &&
      !blockHasHeightOverride &&
      !slotHasHeightOverride;
    const slotBaseStyle: CSSProperties = {
      ...(!isNestedSlot ? { alignSelf: "stretch" } : {}),
      ...(shouldApplyDefaultSlotMinHeight ? { minHeight: "300px" } : {}),
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
        ref={(node) => {
          if (node) {
            slotRefs.current[slotKey] = node;
          } else {
            delete slotRefs.current[slotKey];
          }
        }}
        className={`relative w-full min-w-0 rounded-xl ${!hasCustomStyle && !widget && !hasChildren ? "bg-[#ECECEC]" : ""} ${hasChildren ? "p-3" : ""}`}
        style={{ ...slotBaseStyle, ...slotStyle, ...slotPlacementStyle }}
        data-test-id={`builder-slot-${block.id}-${slotIdx}`}
      >
        {!previewMode && !widget && !hasChildren && !isCompactSlot && (
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); openGroqChat(block.id, slotIdx); }}
              className="text-slate-400 hover:text-purple-500 bg-white/80 backdrop-blur-sm rounded p-1 shadow-sm transition-colors"
              title="Ask AI to style this column"
              data-test-id={`builder-empty-slot-ai-style-${block.id}-${slotIdx}`}
            >
              <Sparkles className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); openCssEditorWithDraft(block, slotIdx); }}
              className="text-slate-400 hover:text-blue-500 bg-white/80 backdrop-blur-sm rounded p-1 shadow-sm transition-colors"
              title="Edit column styles"
              data-test-id={`builder-empty-slot-edit-${block.id}-${slotIdx}`}
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}

        {widget && (
          <div className="flex flex-col h-full" data-test-id={`builder-slot-filled-${block.id}-${slotIdx}`}>
            {!previewMode && (
              <div className={`flex mb-2 flex-shrink-0 ${isCompactSlot ? "items-center justify-end" : "items-center justify-between"}`} data-test-id={`builder-slot-header-${block.id}-${slotIdx}`}>
                {!isCompactSlot && <span className="text-xs font-semibold text-slate-500 truncate">{widget.title}</span>}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openGroqChat(block.id, slotIdx)}
                    className="text-slate-400 hover:text-purple-500 flex-shrink-0"
                    title="Ask AI to style this slot"
                    data-test-id={`builder-slot-ai-${block.id}-${slotIdx}`}
                  >
                    <Sparkles className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => { openCssEditorWithDraft(block, slotIdx); }}
                    className="text-slate-400 hover:text-blue-500 flex-shrink-0"
                    title="Edit slot styles"
                    data-test-id={`builder-slot-edit-${block.id}-${slotIdx}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeWidget(block.id, slotIdx)}
                    className="text-slate-400 hover:text-red-500 flex-shrink-0 ml-1"
                    data-test-id={`builder-slot-clear-${block.id}-${slotIdx}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            <div className="w-full flex-1 min-h-0 min-w-0 overflow-hidden" data-test-id={`builder-slot-widget-${block.id}-${slotIdx}`}>
              <div className="min-w-0 h-full">
                {WIDGET_PREVIEWS[widget.widgetId]
                  ? WIDGET_PREVIEWS[widget.widgetId](widget.widgetData)
                  : <span className="text-slate-400 text-xs">No preview</span>
                }
              </div>
            </div>
          </div>
        )}

        {!widget && !hasChildren && !previewMode && (
          <div className={`flex h-full w-full items-center justify-center ${shouldApplyDefaultSlotMinHeight ? "min-h-[200px]" : "min-h-0"}`}>
            <div className={`flex w-full px-2 py-2 ${isCompactSlot ? "flex-col items-stretch gap-1.5" : "max-w-[420px] flex-wrap items-center justify-center gap-2"}`}>
              <button
                onClick={() => handleAddWidget(block.id, slotIdx)}
                className={`inline-flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all group ${isCompactSlot ? "w-full px-2 py-1.5" : "px-4 py-2 whitespace-nowrap"}`}
                data-test-id={`builder-slot-add-widget-${block.id}-${slotIdx}`}
              >
                <div className={`${isCompactSlot ? "w-5 h-5" : "w-6 h-6"} bg-slate-100 group-hover:bg-blue-100 rounded-md flex items-center justify-center transition-colors`}>
                  <Plus className={`${isCompactSlot ? "w-3 h-3" : "w-3.5 h-3.5"} text-slate-400 group-hover:text-blue-500`} />
                </div>
                <span className={`${isCompactSlot ? "text-[11px]" : "text-xs"} font-medium text-slate-500 group-hover:text-blue-600`}>Add Widget</span>
              </button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleAddLayout(block.id, slotIdx)}
                className={`${isCompactSlot ? "h-8 w-full px-2 text-[11px]" : "h-9 px-3 text-xs whitespace-nowrap"} text-slate-500 hover:text-blue-600`}
                data-test-id={`builder-slot-add-layout-${block.id}-${slotIdx}`}
              >
                Add layout
              </Button>

              <Button
                size="icon"
                className={`${isCompactSlot ? "h-8 w-8 self-center" : "h-9 w-9"} rounded-full border border-[var(--primary)]/20 bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm transition-colors hover:bg-[var(--primary)]/90 flex-shrink-0`}
                onClick={() => setAiPromptModal({ blockId: block.id, slotIdx })}
                data-test-id={`builder-slot-ai-open-${block.id}-${slotIdx}`}
              >
                <Sparkles className="w-4 h-4" />
              </Button>
              {isCompactSlot && (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 self-center"
                  onClick={() => openCssEditorWithDraft(block, slotIdx)}
                  data-test-id={`builder-slot-edit-compact-${block.id}-${slotIdx}`}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        )}

        {hasChildren && (
          <div className={`${widget ? "mt-4" : "mt-0"} flex min-h-0 flex-col gap-3 ${hasHeightConstraint ? "h-full" : ""}`} data-test-id={`builder-slot-children-${block.id}-${slotIdx}`}>
            {!previewMode && (
              <div className={`flex items-center ${isCompactSlot ? "flex-col gap-2 items-start" : "justify-between"}`}>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Nested layout</p>
                  <p className="text-xs text-slate-500">Child columns stay inside this parent wrapper.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddLayout(block.id, slotIdx)}
                  className={isCompactSlot ? "w-full" : ""}
                  data-test-id={`builder-slot-add-layout-inline-${block.id}-${slotIdx}`}
                >
                  Add layout
                </Button>
              </div>
            )}
            <div className="rounded-xl p-3 flex-1 min-h-0">
              <div className="space-y-3 min-h-0">
                {childBlocks.map((childBlock) => renderBlock(childBlock, depth + 1))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBlock = (block: LayoutBlock, depth = 0) => {
    console.log(`Debug flow: renderBlock fired with`, { blockId: block.id, depth, slotCount: block.slots.length });
    const blockStyle = cssStringToStyle(block.blockStyles ?? "");
    return (
      <div
        key={block.id}
        className=""
        style={blockStyle}
        data-test-id={`builder-block-${block.id}`}
      >
        {!previewMode && (
          <div className={`flex items-center justify-between px-4 py-2 border-b border-slate-200 ${depth > 0 ? "bg-slate-100" : "bg-slate-50"}`} data-test-id={`builder-block-header-${block.id}`}>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {depth > 0 ? "Nested" : ""}
              {depth > 0 ? " " : ""}
              {LAYOUT_OPTIONS.find((layout) => layout.type === block.type)?.label ?? block.type}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openGroqChat(block.id, -1)}
                className="text-slate-400 hover:text-purple-500 transition-colors"
                title="Ask AI to style this block"
                data-test-id={`builder-block-ai-${block.id}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { openCssEditorWithDraft(block); }}
                className="text-slate-400 hover:text-blue-500 transition-colors"
                title="Edit block styles"
                data-test-id={`builder-block-edit-${block.id}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {block.slots.length > 1 && (
                <button
                  onClick={() => handleOpenGridRatioModal(block)}
                  className="text-slate-400 hover:text-green-500 transition-colors"
                  title="Set column ratio"
                  data-test-id={`builder-block-ratio-${block.id}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => removeBlock(block.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                data-test-id={`builder-block-delete-${block.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
        <div className={`${getBlockContainerClass(block)} mt-0`} style={getBlockContainerStyle(block)} data-test-id={`builder-block-grid-${block.id}`}>
          {block.slots.map((slot, slotIdx) => renderSlotContent(block, slot, slotIdx, depth, blockStyle))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50" data-test-id="builder-shell">

      {/* ── Left Sidebar ── */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden" data-test-id="builder-sidebar">
          {/* Brand */}
          <div className="px-4 py-4 border-b border-slate-100" data-test-id="builder-sidebar-brand">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <LayoutGrid className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800 text-sm">OpenDash</span>
            </div>
          </div>

          {/* Sidebar nav — dynamic items from DB */}
          <div className="flex-1 overflow-y-auto px-3 py-3" data-test-id="builder-sidebar-nav">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider" data-test-id="builder-sidebar-nav-label">Navigation</p>
            </div>
            <div className="space-y-0.5 mb-2" data-test-id="builder-sidebar-nav-items">
              {navItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer text-xs font-medium group"
                  data-test-id={`builder-nav-item-${item.id}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="truncate flex-1">{item.label}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeNavItem(item.id); }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all flex-shrink-0"
                    title="Delete nav item"
                    data-test-id={`builder-nav-item-delete-${item.id}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={openNavItemModal}
              disabled={addingNavItem || loadingNavItems}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 border border-dashed border-slate-200 text-xs hover:border-blue-300 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-400"
              data-test-id="builder-sidebar-add-nav-btn"
            >
              {addingNavItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {addingNavItem ? "Adding..." : "Add nav item"}
            </button>
          </div>
        </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" data-test-id="builder-main">

        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between" data-test-id="builder-header">
          <div className="flex items-center gap-3">
            {previewMode && (
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-800 text-sm">Dashboard Builder</span>
              </div>
            )}
            {!previewMode && (
              <Button size="sm" variant="outline" onClick={openLayoutPicker} data-test-id="builder-add-block-btn">
                <Plus className="w-4 h-4 mr-1" /> Add Block
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePreview}
              data-test-id="builder-preview-toggle"
            >
              {previewMode ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button
              size="sm"
              disabled={blocks.length === 0 || savingLayout}
              onClick={() => setSaveDialogOpen(true)}
              data-test-id="builder-save-btn"
            >
              {savingLayout ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save & Preview →
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto px-6 py-6" data-test-id="builder-canvas">
          {blocks.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" data-test-id="builder-empty-state">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-blue-200">
                <LayoutGrid className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Your dashboard is empty</h2>
              <p className="text-slate-500 mb-8 max-w-sm text-sm">
                Click <strong>Add Block</strong> to choose a layout, then select an empty slot and pick a widget from the sidebar.
              </p>
              <Button 
                size="lg" 
                onClick={openLayoutPicker} 
                disabled={navItems.length === 0}
                className={navItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
                data-test-id="builder-empty-cta"
              >
                <Plus className="w-5 h-5 mr-2" /> Start building
              </Button>
            </div>
          )}

          <div className="space-y-4 w-full px-6 py-6" data-test-id="builder-blocks">
            {blocks.map((block) => renderBlock(block))}
          </div>

          {blocks.length > 0 && !previewMode && (
            <div className="mt-4 flex justify-center" data-test-id="builder-add-more-row">
              <button
                onClick={openLayoutPicker}
                disabled={navItems.length === 0}
                className={`flex items-center gap-2 px-4 py-2 text-sm border border-dashed rounded-lg transition-colors ${
                  navItems.length === 0
                    ? "text-slate-300 border-slate-200 cursor-not-allowed"
                    : "text-slate-500 border-slate-300 hover:border-blue-400 hover:text-blue-500"
                }`}
                data-test-id="builder-add-more-btn"
              >
                <Plus className="w-4 h-4" /> Add another block
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Layout Picker ── */}
      <Dialog open={showLayoutPicker} onOpenChange={closeLayoutPicker}>
        <DialogContent className="max-w-3xl bg-white" data-test-id="builder-layout-picker-modal">
          <DialogHeader>
            <DialogTitle>Choose a layout</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-2" data-test-id="builder-layout-tabs">
              <TabsTrigger value="basic" data-test-id="builder-layout-tab-basic">Basic Layouts</TabsTrigger>
              <TabsTrigger value="templates" data-test-id="builder-layout-tab-templates">Dashboard Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="mt-4" data-test-id="builder-layout-basic-content">
              <div className="grid grid-cols-2 gap-3">
                {LAYOUT_OPTIONS.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => addBlock(opt.type)}
                    className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                    data-test-id={`builder-layout-option-${opt.type}`}
                  >
                    <LayoutVisual cols={opt.cols} />
                    <p className="text-sm font-semibold text-slate-700 mt-3 group-hover:text-blue-700">{opt.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.cols} {opt.cols === 1 ? "slot" : "slots"}</p>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="mt-4" data-test-id="builder-layout-templates-content">
              <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                {DASHBOARD_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                    data-test-id={`builder-template-${template.id}`}
                  >
                    <div className="mb-3 p-3 bg-white rounded-lg border border-slate-200">
                      <TemplateSkeleton templateId={template.id} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{template.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{template.description}</p>
                      <Badge variant="secondary" className="text-[10px] mt-2">{template.category}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={!!aiPromptModal} onOpenChange={(o) => { if (!o) setAiPromptModal(null); }}>
        <DialogContent className="max-w-md border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)]">
          <DialogHeader>
            <DialogTitle>Create with AI</DialogTitle>
          </DialogHeader>
          {aiPromptModal && (
            <div className="space-y-3">
              <Input
                value={aiWidgetPrompts[`${aiPromptModal.blockId}-${aiPromptModal.slotIdx}`] ?? ""}
                onChange={(e) => setAiWidgetPrompts((prev) => ({ ...prev, [`${aiPromptModal.blockId}-${aiPromptModal.slotIdx}`]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") { handleGenerateAiWidget(aiPromptModal.blockId, aiPromptModal.slotIdx); setAiPromptModal(null); } }}
                placeholder="Describe a widget…"
                className="border-[var(--border)] bg-[var(--muted)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                disabled={aiWidgetLoading === `${aiPromptModal.blockId}-${aiPromptModal.slotIdx}`}
                data-test-id={`builder-ai-modal-input-${aiPromptModal.blockId}-${aiPromptModal.slotIdx}`}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setAiPromptModal(null)} data-test-id="builder-ai-modal-cancel">Cancel</Button>
                <Button
                  size="sm"
                  className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
                  disabled={!aiWidgetPrompts[`${aiPromptModal.blockId}-${aiPromptModal.slotIdx}`]?.trim() || aiWidgetLoading === `${aiPromptModal.blockId}-${aiPromptModal.slotIdx}`}
                  onClick={() => { handleGenerateAiWidget(aiPromptModal.blockId, aiPromptModal.slotIdx); setAiPromptModal(null); }}
                  data-test-id="builder-ai-modal-send"
                >
                  {aiWidgetLoading === `${aiPromptModal.blockId}-${aiPromptModal.slotIdx}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* ── Modal: Widget Variant Picker ── */}
      <Dialog open={!!showWidgetVariantPicker} onOpenChange={closeWidgetVariantPicker}>
        <DialogContent className="flex h-[calc(100vh-2rem)] min-w-[calc(100vw-2rem)] flex-col gap-0 p-0 bg-white overflow-hidden" data-test-id="builder-variant-picker-modal">
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white flex-shrink-0">
            <DialogTitle>
              {showWidgetVariantPicker
                ? `Choose a ${WIDGET_CATEGORIES.find(c => c.id === showWidgetVariantPicker.category)?.label ?? showWidgetVariantPicker.category} widget`
                : "Choose widget"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {loadingTemplates ? (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm" data-test-id="builder-variant-loading">Loading widgets…</div>
            ) : variantTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2" data-test-id="builder-variant-empty">
                <p className="text-slate-500 text-sm">No widgets found for this category.</p>
                <Badge variant="secondary">Try seeding the DB with widgets</Badge>
              </div>
            ) : (
              <div className="p-6" data-test-id="builder-variant-grid">
                <WidgetPickerCard
                  templates={variantTemplates as unknown as WidgetTemplateWithDates[]}
                  onSelect={(template: WidgetTemplateWithDates) => {
                    if (showWidgetVariantPicker) {
                      placeWidget(showWidgetVariantPicker.blockId, showWidgetVariantPicker.slotIdx, {
                        slug: template.slug,
                        category: template.category,
                        title: template.title,
                        description: template.description,
                        jsxCode: template.jsxCode,
                        widgetData: template.widgetData,
                      } as WidgetTemplate);
                    }
                    setSelectedSlot(null);
                  }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Save & Preview ── */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-sm bg-white" data-test-id="builder-save-dialog">
          <DialogHeader>
            <DialogTitle>Save Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="dashboard-name" data-test-id="builder-save-name-label">Dashboard name</Label>
              <Input
                id="dashboard-name"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="My Dashboard"
                data-test-id="builder-save-name-input"
              />
            </div>
            <Button
              className="w-full"
              disabled={savingLayout}
              onClick={handleSave}
              data-test-id="builder-save-confirm-btn"
            >
              {savingLayout ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {savingLayout ? "Saving…" : "Save & open preview"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Widget Category Picker ── */}
      <Dialog open={widgetCategoryModalOpen} onOpenChange={(o) => { if (!o) { closeWidgetCategoryModal(); setSelectedSlot(null); } }}>
        <DialogContent className="max-w-sm bg-white" data-test-id="builder-category-picker-modal">
          <DialogHeader>
            <DialogTitle>Select a widget category</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 mt-2" data-test-id="builder-category-list">
            {SIDEBAR_CATEGORIES.map((cat) => {
              const count = widgetTemplates.filter((w) => w.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  data-test-id={`builder-category-option-${cat.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${cat.color}`} />
                    <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                  </div>
                  {!loadingTemplates && count > 0 && (
                    <span className="text-xs text-slate-400">{count} widgets</span>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Code Editor (CSS / Data / Function tabs) ── */}
      <Dialog
        open={!!cssEditorState}
        onOpenChange={(o) => { if (!o) { closeCssEditor(); setDataJsonError(null); } }}
      >
        <DialogContent
          className="max-w-2xl p-0 overflow-hidden bg-[#1e1e1e] border border-slate-700 [&_[data-slot=dialog-close]]:text-white"
          data-test-id="builder-css-editor-modal"
        >
          <DialogTitle className="sr-only">Edit Styles</DialogTitle>
          {/* Title bar */}
          <div className="flex items-center gap-0 bg-[#2d2d2d] border-b border-slate-700" data-test-id="builder-css-editor-titlebar">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1e1e1e] border-r border-slate-700">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xs text-slate-400 px-3 py-2 font-mono">
              {cssEditorState?.slotIdx === -1
                ? `Block Container Styles (No widget selected)`
                : cssEditorState?.widgetTitle
                  ? `${cssEditorState.widgetTitle} (Widget) — Column ${(cssEditorState?.slotIdx ?? 0) + 1}`
                  : `Column ${(cssEditorState?.slotIdx ?? 0) + 1} Styles (CSS only)`
              }
            </span>
          </div>

          {/* Tabbed editor */}
          <Tabs
            value={codeEditorTab}
            onValueChange={(v) => { setCodeEditorTab(v as CodeEditorTab); setDataJsonError(null); }}
            data-test-id="builder-code-editor-tabs"
          >
            <TabsList className="w-full justify-start rounded-none bg-[#2d2d2d] border-b border-slate-700 px-2 pt-1" data-test-id="builder-code-editor-tablist">
              <TabsTrigger
                value="css"
                className="text-xs data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-slate-200 text-slate-500 rounded-t-sm px-3 py-1.5"
                data-test-id="builder-tab-css"
              >
                CSS
              </TabsTrigger>
              {cssEditorState?.widgetData && Object.keys(cssEditorState.widgetData).length > 0 && (
                <>
                  <TabsTrigger
                    value="data"
                    className="text-xs data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-slate-200 text-slate-500 rounded-t-sm px-3 py-1.5"
                    data-test-id="builder-tab-data"
                  >
                    Data
                  </TabsTrigger>
                  <TabsTrigger
                    value="function"
                    className="text-xs data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-slate-200 text-slate-500 rounded-t-sm px-3 py-1.5"
                    data-test-id="builder-tab-function"
                  >
                    Function
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* CSS tab */}
            <TabsContent value="css" className="mt-0" data-test-id="builder-tab-content-css">
              <textarea
                value={cssEditorDraft}
                onChange={(e) => setCssEditorDraft(e.target.value)}
                spellCheck={false}
                placeholder={`/* Add CSS declarations */\nbackground-color: #fff;\npadding: 16px;\nborder-radius: 8px;`}
                className="w-full h-56 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm px-4 py-4 resize-none outline-none placeholder:text-slate-600 border-0"
                style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
                data-test-id="builder-css-editor-textarea"
              />
              <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-t border-slate-700">
                <span className="text-[10px] text-slate-500 font-mono">CSS • Plain declarations only (no selectors)</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={closeCssEditor} className="text-slate-400" data-test-id="builder-css-editor-cancel-btn">Cancel</Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      saveCssStyles(cssEditorDraft);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-test-id="builder-css-editor-save-btn"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" /> Save styles
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Data tab */}
            <TabsContent value="data" className="mt-0" data-test-id="builder-tab-content-data">
              <textarea
                value={dataEditorDraft}
                onChange={(e) => { setDataEditorDraft(e.target.value); setDataJsonError(null); }}
                spellCheck={false}
                placeholder={`{\n  "title": "My Widget",\n  "value": "$0"\n}`}
                className="w-full h-56 bg-[#1e1e1e] text-[#9cdcfe] font-mono text-sm px-4 py-4 resize-none outline-none placeholder:text-slate-600 border-0"
                style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
                data-test-id="builder-data-editor-textarea"
              />
              {dataJsonError && (
                <div className="px-4 py-1.5 bg-[#1e1e1e] border-t border-red-800" data-test-id="builder-data-json-error">
                  <span className="text-[10px] text-red-400 font-mono">{dataJsonError}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-t border-slate-700">
                <span className="text-[10px] text-slate-500 font-mono">JSON • Widget data object</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={closeCssEditor} className="text-slate-400" data-test-id="builder-data-editor-cancel-btn">Cancel</Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      const err = await saveWidgetDataFromEditor(dataEditorDraft);
                      if (err) { setDataJsonError(err); } else { closeCssEditor(); }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    data-test-id="builder-data-editor-save-btn"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" /> Save data
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Function tab */}
            <TabsContent value="function" className="mt-0" data-test-id="builder-tab-content-function">
              <textarea
                value={functionEditorDraft}
                onChange={(e) => { setFunctionEditorDraft(e.target.value); }}
                spellCheck={false}
                placeholder={`// Add JavaScript function code\nfunction processData(data) {\n  return data;\n}`}
                className="w-full h-56 bg-[#1e1e1e] text-[#dcdcaa] font-mono text-sm px-4 py-4 resize-none outline-none placeholder:text-slate-600 border-0"
                style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
                data-test-id="builder-function-editor-textarea"
              />
              <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-t border-slate-700">
                <span className="text-[10px] text-slate-500 font-mono">JavaScript • Widget function code</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={closeCssEditor} className="text-slate-400" data-test-id="builder-function-editor-cancel-btn">Cancel</Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      const err = await saveWidgetFunctionFromEditor(functionEditorDraft);
                      if (err) { setDataJsonError(err); } else { closeCssEditor(); }
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    data-test-id="builder-function-editor-save-btn"
                  >
                    <Save className="w-3.5 h-3.5 mr-1" /> Save function
                  </Button>
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </DialogContent>
      </Dialog>

      {/* ── Grid Ratio Modal ── */}
      <Dialog
        open={!!gridRatioModal}
        onOpenChange={(o) => {
          if (!o) {
            closeGridRatioModal();
            setGridRatioInput("");
            setGridRatioError("");
            setGridDisplayInput("grid");
            setGridJustifyInput("start");
            setGridAlignInput("stretch");
            setGridGapInput("16px");
          }
        }}
      >
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>Custom Column Ratio</DialogTitle>
          </DialogHeader>
          {(() => {
            const block = gridRatioModal ? findBlock(blocks, gridRatioModal.blockId) : null;
            const columnCount = block?.slots.length ?? 2;
            const exampleInput = columnCount === 2 ? "2/8" : columnCount === 3 ? "5/2/5" : "4/4/2/2";

            const handleApply = () => {
              console.log(`Debug flow: handleApply grid ratio fired with`, { gridRatioInput, columnCount });
              setGridRatioError("");
              const parts = gridRatioInput.trim().split("/").filter((part) => part.trim());

              if (parts.length !== columnCount) {
                setGridRatioError(`Enter ${columnCount} numbers separated by "/" (e.g., ${exampleInput})`);
                return;
              }

              const numbers = parts.map(p => parseFloat(p.trim()));
              if (numbers.some(n => isNaN(n) || n <= 0)) {
                setGridRatioError("All values must be positive numbers");
                return;
              }

              const total = numbers.reduce((sum, n) => sum + n, 0);
              if (total > 12) {
                setGridRatioError("Sum cannot exceed 12");
                return;
              }

              const normalizedGap = (() => {
                const trimmedGap = gridGapInput.trim();
                if (!trimmedGap) return "16px";
                return /^\d+(\.\d+)?$/.test(trimmedGap) ? `${trimmedGap}px` : trimmedGap;
              })();
              const frValue = numbers.map((n) => `${n}fr`).join(" ");
              if (gridRatioModal) {
                saveGridRatio(gridRatioModal.blockId, {
                  ratio: frValue,
                  display: gridDisplayInput,
                  justifyContent: gridJustifyInput,
                  alignItems: gridAlignInput,
                  gap: normalizedGap,
                });
              }
              setGridRatioInput("");
              setGridRatioError("");
            };

            return (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-2">Ratio ({columnCount} columns)</label>
                  <Input
                    value={gridRatioInput}
                    onChange={(e) => { setGridRatioInput(e.target.value); setGridRatioError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleApply()}
                    placeholder={exampleInput}
                    className="text-sm"
                    data-test-id="builder-grid-ratio-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">Display</label>
                    <select
                      value={gridDisplayInput}
                      onChange={(e) => setGridDisplayInput(e.target.value as "grid" | "flex")}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      data-test-id="builder-grid-display-input"
                    >
                      <option value="grid">Grid</option>
                      <option value="flex">Flex</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">Gap</label>
                    <Input
                      value={gridGapInput}
                      onChange={(e) => setGridGapInput(e.target.value)}
                      placeholder="16px"
                      className="text-sm"
                      data-test-id="builder-grid-gap-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">Justify</label>
                    <select
                      value={gridJustifyInput}
                      onChange={(e) => setGridJustifyInput(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      data-test-id="builder-grid-justify-input"
                    >
                      {JUSTIFY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-2">Align</label>
                    <select
                      value={gridAlignInput}
                      onChange={(e) => setGridAlignInput(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                      data-test-id="builder-grid-align-input"
                    >
                      {ALIGN_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-700">Instructions:</p>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li>Enter numbers separated by &quot;/&quot; (e.g., <span className="font-mono font-semibold text-slate-700">{exampleInput}</span>)</li>
                    <li>Each number represents column width proportionally</li>
                    <li>Choose grid or flex, then fine-tune justify, align, and gap</li>
                    <li>Max total value: 12</li>
                  </ul>
                </div>

                {gridRatioError && <div className="text-xs text-red-600 font-medium">{gridRatioError}</div>}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={closeGridRatioModal} className="flex-1" data-test-id="builder-grid-modal-cancel">Cancel</Button>
                  <Button size="sm" onClick={handleApply} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" data-test-id="builder-grid-modal-apply">Apply</Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Groq AI Style Chat Panel ── */}
      {groqChatOpen && (
        <div
          className="fixed right-0 top-0 h-full w-80 bg-white border-l border-slate-200 shadow-2xl flex flex-col z-50"
          data-test-id="builder-ai-chat-panel"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <div>
                <p className="text-sm font-semibold">AI Style Assistant</p>
                {groqChatContext && (
                  <p className="text-[10px] opacity-80">
                    {groqChatContext.blockType} · {groqChatContext.slotIdx < 0 ? "wrapper" : `col ${groqChatContext.slotIdx + 1}`}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={closeGroqChat}
              className="text-white/70 hover:text-white"
              data-test-id="builder-ai-chat-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {groqChatContext?.currentCss && (
            <div className="px-3 py-2 bg-slate-900 border-b border-slate-700">
              <p className="text-[10px] text-slate-400 font-mono mb-1">Current styles:</p>
              <p className="text-[10px] text-green-400 font-mono truncate">{groqChatContext.currentCss}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {groqMessages.length === 0 && (
              <div className="text-center text-xs text-slate-400 mt-8">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <p>Ask me to style this column.</p>
                <p className="mt-1 text-slate-500">e.g. &quot;add background red&quot; or &quot;padding 16px&quot;</p>
              </div>
            )}
            {groqMessages.map((msg, i) => (
              <div
                key={i}
                className={`text-xs rounded-lg px-3 py-2 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white ml-4"
                    : "bg-slate-900 text-green-400 font-mono mr-4"
                }`}
                data-test-id={`builder-ai-chat-msg-${i}`}
              >
                {msg.content}
              </div>
            ))}
            {groqChatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Generating styles…
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-200 relative">
            <Input
              ref={groqInputRef}
              value={groqInput}
              onChange={(e) => {
                const val = e.target.value;
                setGroqInput(val);
                if (val === "/" ) {
                  setSlashMenuOpen(true);
                  setSlashMenuHighlighted(0);
                } else if (!val.startsWith("/") || val.includes(" ")) {
                  setSlashMenuOpen(false);
                }
              }}
              onKeyDown={(e) => {
                if (slashMenuOpen) {
                  if (e.key === "ArrowUp") { e.preventDefault(); setSlashMenuHighlighted((prev) => (prev > 0 ? prev - 1 : 2)); }
                  else if (e.key === "ArrowDown") { e.preventDefault(); setSlashMenuHighlighted((prev) => (prev < 2 ? prev + 1 : 0)); }
                  else if (e.key === "Enter") {
                    const commands = ["/styles ", "/data ", "/config "];
                    setGroqInput(commands[slashMenuHighlighted]);
                    setSlashMenuOpen(false);
                    e.preventDefault();
                  }
                  else if (e.key === "Escape") { setSlashMenuOpen(false); }
                } else if (e.key === "Enter" && !e.shiftKey && groqInput.trim()) {
                  sendGroqMessage(groqInput);
                  setGroqInput("");
                }
              }}
              placeholder="e.g. /styles make it bold / /data update chart"
              className="flex-1 text-xs h-8"
              data-test-id="builder-ai-chat-input"
              autoFocus
            />

            {/* Slash menu dropdown */}
            {slashMenuOpen && (
              <div className="absolute bottom-10 left-3 bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-48">
                {[
                  { label: "/styles", desc: "CSS styling & layout" },
                  { label: "/data", desc: "Update widget data" },
                  { label: "/config", desc: "Table & widget config" },
                ].map((cmd, idx) => (
                  <button
                    key={cmd.label}
                    onClick={() => { setGroqInput(cmd.label + " "); setSlashMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${idx === slashMenuHighlighted ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
                  >
                    <span className="font-mono font-bold">{cmd.label}</span>
                    <span className="text-slate-500 ml-2">{cmd.desc}</span>
                  </button>
                ))}
              </div>
            )}
            <Button
              size="sm"
              className="h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700"
              disabled={!groqInput.trim() || groqChatLoading}
              onClick={() => { sendGroqMessage(groqInput); setGroqInput(""); }}
              data-test-id="builder-ai-chat-send-btn"
            >
              {groqChatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      )}

      {/* ── Modal: Add Nav Item ── */}
      <Dialog open={navItemModalOpen} onOpenChange={(o) => { if (!o) { closeNavItemModal(); setNavItemLabel(""); } }}>
        <DialogContent className="max-w-sm bg-white" data-test-id="builder-nav-item-modal">
          <DialogHeader>
            <DialogTitle>Add navigation item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="nav-item-label" data-test-id="builder-nav-item-label">Page name</Label>
              <Input
                id="nav-item-label"
                value={navItemLabel}
                onChange={(e) => setNavItemLabel(e.target.value)}
                placeholder="e.g. Overview"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleAddNavItem(); }}
                data-test-id="builder-nav-item-input"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { closeNavItemModal(); setNavItemLabel(""); }}
                data-test-id="builder-nav-item-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!navItemLabel.trim() || addingNavItem}
                onClick={handleAddNavItem}
                data-test-id="builder-nav-item-save-btn"
              >
                {addingNavItem ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {addingNavItem ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
