"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, X, LayoutGrid, Save, Eye, EyeOff,
  Loader2, ChevronRight, Pencil, Sparkles,
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
import { useBuilder } from "./useBuilder";
import { WIDGET_PREVIEWS, WIDGET_CATEGORIES } from "@/presentation/widgets";
import type { LayoutBlock, LayoutSlot } from "@/domain/builder/types";
import type { WidgetTemplate } from "@/domain/widgets/types";
import { DASHBOARD_TEMPLATES } from "@/lib/dashboard-templates";
import { WidgetPickerCard } from "@/components/widgets/widget-picker-card";
import type { WidgetTemplate as WidgetTemplateWithDates } from "@/presentation/widgets/useWidgets";
import { GridPlyaGroundModal, getGridPlaygroundSlotPlacement } from "@/components/gridPlyaGround";
import { LAYOUT_OPTIONS, SIDEBAR_CATEGORIES } from "./builder.constants";
import {
  buildWidgetElementOverrideCss,
  buildWidgetThemeOverrideCss,
  cssStringToStyle,
  findBlock,
  getBlockContainerClass,
  getBlockContainerStyle,
  getCssEditorSeed,
} from "./builder.utils";
import { LayoutVisual, TemplateSkeleton } from "./modules/layoutVisuals";
import { BuilderAiChatPanel, BuilderCodeEditorDialog } from "./modules/BuilderPanels";
import {
  EmptyStateSection,
  LayoutPickerDialog,
  AiPromptDialog,
  WidgetVariantPickerDialog,
  SaveDialog,
  WidgetCategoryPickerDialog,
  NavItemDialog,
} from "./modules/BuilderDialogs";

export default function BuilderShell() {
  const router = useRouter();
  const {
    blocks,
    navItems,
    activeNavItemId,
    navItemModalOpen,
    addingNavItem,
    loadingNavItems,
    widgetCategoryModalOpen,
    showLayoutPicker,
    showWidgetTypePicker,
    showWidgetVariantPicker,
    widgetTemplates,
    customWidgetTemplates,
    loadingTemplates,
    variantTemplates,
    previewMode,
    isDraftRestoring,
    savingLayout,
    autosaveState,
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
    setActiveNavItemId,
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
    clearSlotContent,
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

  useEffect(() => {
    console.log(`Debug flow: builder beforeunload effect fired with`, {
      isDraftSavedLocally: autosaveState.isDraftSavedLocally,
      isAutosaving: autosaveState.isAutosaving,
      savingLayout,
    });
    const shouldBlockUnload =
      savingLayout ||
      autosaveState.isAutosaving ||
      !autosaveState.isDraftSavedLocally;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log(`Debug flow: handleBeforeUnload fired with`, { shouldBlockUnload });
      if (!shouldBlockUnload) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [autosaveState.isAutosaving, autosaveState.isDraftSavedLocally, savingLayout]);

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

  const handleQuickSave = async () => {
    console.log(`Debug flow: handleQuickSave fired with`, { dashboardName });
    await saveLayout(dashboardName);
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
    const widgetElementOverrideCss = buildWidgetElementOverrideCss(rawSlotCss ?? "");
    const widgetStyleScope = `builder-slot-widget-${block.id}-${slotIdx}`;
    const widgetThemeOverrideCss = buildWidgetThemeOverrideCss(rawSlotCss ?? "", widgetStyleScope);
    const slotPlacementStyle = getGridPlaygroundSlotPlacement(block, slotIdx);
    const hasCustomStyle = Object.keys(slotStyle).length > 0;
    const hasChildren = childBlocks.length > 0;
    const isButtonWidget = widget?.category === "button";
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
      padding: "20px",
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
        className={`relative w-full min-w-0 rounded-[28px] border border-slate-200/80 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] ${!hasCustomStyle && !widget && !hasChildren ? "bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]" : ""}`}
        style={{ ...slotBaseStyle, ...slotStyle, ...slotPlacementStyle }}
        data-test-id={`builder-slot-${block.id}-${slotIdx}`}
      >
        {!previewMode && !widget && !isCompactSlot && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); openGroqChat(block.id, slotIdx); }}
              className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-600"
              title="Ask AI to style this column"
              data-test-id={`builder-empty-slot-ai-style-${block.id}-${slotIdx}`}
            >
              <Sparkles className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); openCssEditorWithDraft(block, slotIdx); }}
              className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-600"
              title="Edit column styles"
              data-test-id={`builder-empty-slot-edit-${block.id}-${slotIdx}`}
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearSlotContent(block.id, slotIdx);
              }}
              className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition-colors hover:border-red-200 hover:text-red-500"
              title="Clear column content"
              data-test-id={`builder-empty-slot-clear-${block.id}-${slotIdx}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {widget && (
          <div className="flex flex-col h-full" data-test-id={`builder-slot-filled-${block.id}-${slotIdx}`}>
            {widgetElementOverrideCss && (
              <style data-test-id={`builder-slot-widget-style-${block.id}-${slotIdx}`}>
                {`[data-test-id="${widgetStyleScope}"] { ${widgetElementOverrideCss} }`}
              </style>
            )}
            {widgetThemeOverrideCss && (
              <style data-test-id={`builder-slot-widget-theme-style-${block.id}-${slotIdx}`}>
                {widgetThemeOverrideCss}
              </style>
            )}
            {!previewMode && (
              <div className={`mb-3 flex flex-shrink-0 ${isCompactSlot ? "items-center justify-end" : "items-center justify-between gap-3"}`} data-test-id={`builder-slot-header-${block.id}-${slotIdx}`}>
                {!isCompactSlot && <span className="truncate text-xs font-semibold tracking-[0.12em] text-slate-400 uppercase">{widget.title}</span>}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openGroqChat(block.id, slotIdx)}
                    className="flex-shrink-0 rounded-full border border-transparent p-1.5 text-slate-400 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600"
                    title="Ask AI to style this slot"
                    data-test-id={`builder-slot-ai-${block.id}-${slotIdx}`}
                  >
                    <Sparkles className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => { openCssEditorWithDraft(block, slotIdx); }}
                    className="flex-shrink-0 rounded-full border border-transparent p-1.5 text-slate-400 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600"
                    title="Edit slot styles"
                    data-test-id={`builder-slot-edit-${block.id}-${slotIdx}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => clearSlotContent(block.id, slotIdx)}
                    className="ml-1 flex-shrink-0 rounded-full border border-transparent p-1.5 text-slate-400 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                    data-test-id={`builder-slot-clear-${block.id}-${slotIdx}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            <div
              className="flex flex-1 min-h-0 min-w-0 overflow-hidden"
              style={isButtonWidget
                ? {
                    justifyContent: slotStyle.justifyContent,
                    alignItems: slotStyle.alignItems,
                  }
                : undefined}
              data-test-id={`builder-slot-widget-${block.id}-${slotIdx}`}
            >
              <div className={isButtonWidget ? "inline-flex min-w-0 max-w-full" : "min-w-0 h-full w-full"}>
                {WIDGET_PREVIEWS[widget.widgetId]
                  ? WIDGET_PREVIEWS[widget.widgetId](widget.widgetData)
                  : <span className="text-slate-400 text-xs">No preview</span>
                }
              </div>
            </div>
          </div>
        )}

        {!widget && !hasChildren && !previewMode && (
          <div className={`flex h-full w-full items-center justify-center ${shouldApplyDefaultSlotMinHeight ? "min-h-[220px]" : "min-h-0"}`}>
            <div className={`flex w-full px-3 py-3 ${isCompactSlot ? "flex-col items-stretch gap-2" : "max-w-[420px] flex-wrap items-center justify-center gap-3"}`}>
              <button
                onClick={() => handleAddWidget(block.id, slotIdx)}
                className={`group inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 transition-all hover:border-blue-400 hover:bg-blue-50 ${isCompactSlot ? "w-full px-3 py-2" : "px-5 py-3 whitespace-nowrap"}`}
                data-test-id={`builder-slot-add-widget-${block.id}-${slotIdx}`}
              >
                <div className={`${isCompactSlot ? "h-5 w-5" : "h-7 w-7"} flex items-center justify-center rounded-xl bg-white shadow-sm transition-colors group-hover:bg-blue-100`}>
                  <Plus className={`${isCompactSlot ? "w-3 h-3" : "w-3.5 h-3.5"} text-slate-400 group-hover:text-blue-500`} />
                </div>
                <span className={`${isCompactSlot ? "text-[11px]" : "text-xs"} font-medium text-slate-600 group-hover:text-blue-700`}>Add Widget</span>
              </button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleAddLayout(block.id, slotIdx)}
                className={`${isCompactSlot ? "h-9 w-full px-3 text-[11px]" : "h-10 px-4 text-xs whitespace-nowrap"} rounded-2xl border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700`}
                data-test-id={`builder-slot-add-layout-${block.id}-${slotIdx}`}
              >
                Add layout
              </Button>

              <Button
                size="icon"
                className={`${isCompactSlot ? "h-9 w-9 self-center" : "h-10 w-10"} flex-shrink-0 rounded-full border border-blue-200 bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700`}
                onClick={() => setAiPromptModal({ blockId: block.id, slotIdx })}
                data-test-id={`builder-slot-ai-open-${block.id}-${slotIdx}`}
              >
                <Sparkles className="w-4 h-4" />
              </Button>
              {isCompactSlot && (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 self-center rounded-full border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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
              <div className={`flex items-start justify-between gap-3 ${isCompactSlot ? "flex-col items-start gap-2" : ""}`}>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Nested layout</p>
                  <p className="text-xs text-slate-500">Child columns stay inside this parent wrapper.</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    onClick={() => openGroqChat(block.id, slotIdx)}
                    className="rounded-full border border-transparent p-1.5 text-slate-400 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600"
                    title="Ask AI to style this column"
                    data-test-id={`builder-slot-children-ai-${block.id}-${slotIdx}`}
                  >
                    <Sparkles className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => { openCssEditorWithDraft(block, slotIdx); }}
                    className="rounded-full border border-transparent p-1.5 text-slate-400 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600"
                    title="Edit column styles"
                    data-test-id={`builder-slot-children-edit-${block.id}-${slotIdx}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => clearSlotContent(block.id, slotIdx)}
                    className="rounded-full border border-transparent p-1.5 text-slate-400 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                    title="Clear column content"
                    data-test-id={`builder-slot-children-clear-${block.id}-${slotIdx}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            <div className="flex-1 min-h-0">
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
        className="min-w-0"
        style={blockStyle}
        data-test-id={`builder-block-${block.id}`}
      >
        {!previewMode && (
          <div className={`flex min-w-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 ${depth > 0 ? "bg-slate-50" : "bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]"}`} data-test-id={`builder-block-header-${block.id}`}>
            <span className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              {depth > 0 ? "Nested" : ""}
              {depth > 0 ? " " : ""}
              {LAYOUT_OPTIONS.find((layout) => layout.type === block.type)?.label ?? block.type}
            </span>
            <div className="flex flex-shrink-0 items-center gap-1">
              <button
                onClick={() => openGroqChat(block.id, -1)}
                className="rounded-full border border-transparent p-1.5 text-slate-400 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600"
                title="Ask AI to style this block"
                data-test-id={`builder-block-ai-${block.id}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { openCssEditorWithDraft(block); }}
                className="rounded-full border border-transparent p-1.5 text-slate-400 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600"
                title="Edit block styles"
                data-test-id={`builder-block-edit-${block.id}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {block.slots.length > 1 && (
                <button
                  onClick={() => handleOpenGridRatioModal(block)}
                  className="rounded-full border border-transparent p-1.5 text-slate-400 transition-colors hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600"
                  title="Set column ratio"
                  data-test-id={`builder-block-ratio-${block.id}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => removeBlock(block.id)}
                className="rounded-full border border-transparent p-1.5 text-slate-400 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-500"
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

  const selectedGridBlock = gridRatioModal ? findBlock(blocks, gridRatioModal.blockId) : null;
  const isBuilderHydrating =
    loadingNavItems ||
    isDraftRestoring ||
    (!!projectId && navItems.length > 0 && !activeNavItemId);

  return (
    <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef4ff_48%,#f8fafc_100%)]" data-test-id="builder-shell">

      {/* ── Left Sidebar ── */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] flex flex-col overflow-hidden" data-test-id="builder-sidebar">
          {/* Brand */}
          <div className="border-b border-slate-200/80 px-5 py-5" data-test-id="builder-sidebar-brand">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_14px_24px_-16px_rgba(37,99,235,0.8)]">
                <LayoutGrid className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-slate-800 uppercase">OpenDash</p>
                <p className="text-[11px] text-slate-400">Builder workspace</p>
              </div>
            </div>
          </div>

          {/* Sidebar nav — dynamic items from DB */}
          <div className="flex-1 overflow-y-auto px-4 py-5" data-test-id="builder-sidebar-nav">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400" data-test-id="builder-sidebar-nav-label">Navigation</p>
            </div>
            <div className="mb-3 space-y-1.5" data-test-id="builder-sidebar-nav-items">
              {navItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveNavItemId(item.id)}
                  className={`group flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 text-xs font-medium shadow-[0_10px_30px_-28px_rgba(15,23,42,0.5)] transition-all ${
                    activeNavItemId === item.id
                      ? "border-blue-200 bg-blue-50 text-blue-900"
                      : "border-transparent bg-white/80 text-slate-700 hover:border-slate-200 hover:bg-white"
                  }`}
                  data-test-id={`builder-nav-item-${item.id}`}
                >
                  <div className={`h-2 w-2 flex-shrink-0 rounded-full ${activeNavItemId === item.id ? "bg-blue-600" : "bg-blue-500"}`} />
                  <span className="truncate flex-1">{item.label}</span>
                  {!previewMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeNavItem(item.id); }}
                      className="flex-shrink-0 text-slate-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                      title="Delete nav item"
                      data-test-id={`builder-nav-item-delete-${item.id}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!previewMode && (
              <button
                onClick={openNavItemModal}
                disabled={addingNavItem || loadingNavItems}
                className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-slate-50 disabled:hover:text-slate-500"
                data-test-id="builder-sidebar-add-nav-btn"
              >
                {addingNavItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {addingNavItem ? "Adding..." : "Add nav item"}
              </button>
            )}
          </div>
        </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex min-w-0 flex-col overflow-hidden" data-test-id="builder-main">

        {/* Header */}
        <div className="flex-shrink-0 border-b border-slate-200/80 bg-white/80 px-8 py-5 backdrop-blur" data-test-id="builder-header">
          <div className="flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Dashboard Builder</p>
              <div className="mt-1 flex items-center gap-3">
                <h1 className="truncate font-semibold text-slate-900">{dashboardName}</h1>
                <Badge variant="secondary" className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-medium text-slate-500">
                  {previewMode ? "Preview mode" : "Editing"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden min-w-[180px] text-right sm:block" data-test-id="builder-save-status">
                <p className="text-[11px] font-medium text-slate-500">
                  {savingLayout
                    ? "Saving layout..."
                    : autosaveState.isAutosaving
                      ? "Autosaving..."
                      : autosaveState.hasUnsavedChanges
                        ? "Unsaved changes"
                        : "All changes saved"}
                </p>
                <p className="text-[10px] text-slate-400">
                  {autosaveState.isDraftSavedLocally
                    ? autosaveState.lastSavedAt
                      ? `Draft saved ${new Date(autosaveState.lastSavedAt).toLocaleTimeString()}`
                      : "Draft saved in database"
                    : "Saving draft to database..."}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={togglePreview}
                className="rounded-full border-slate-300 bg-white px-4 text-slate-700 hover:bg-slate-50"
                data-test-id="builder-preview-toggle"
              >
                {previewMode ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                Preview
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={blocks.length === 0 || savingLayout}
                onClick={() => { void handleQuickSave(); }}
                className="rounded-full border-slate-300 bg-white px-4 text-slate-700 hover:bg-slate-50"
                data-test-id="builder-save-btn"
              >
                {savingLayout ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
              <Button
                size="sm"
                disabled={blocks.length === 0 || savingLayout}
                onClick={() => setSaveDialogOpen(true)}
                className="rounded-full bg-blue-600 px-5 text-white shadow-[0_16px_30px_-18px_rgba(37,99,235,0.8)] hover:bg-blue-700"
                data-test-id="builder-publish-btn"
              >
                Publish
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto px-8 py-8" data-test-id="builder-canvas">
          {isBuilderHydrating && (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500" data-test-id="builder-restore-loading">
              Loading saved layout styles...
            </div>
          )}

          {!isBuilderHydrating && blocks.length === 0 && (
            <EmptyStateSection openLayoutPicker={openLayoutPicker} navItems={navItems} />
          )}

          {!isBuilderHydrating && (
            <div className="w-full space-y-5" data-test-id="builder-blocks">
              {blocks.map((block) => renderBlock(block))}
            </div>
          )}

          {!isBuilderHydrating && blocks.length > 0 && !previewMode && (
            <div className="mt-6 flex justify-center" data-test-id="builder-add-more-row">
              <button
                onClick={openLayoutPicker}
                disabled={navItems.length === 0}
                className={`flex items-center gap-2 rounded-full border border-dashed px-5 py-3 text-sm transition-colors ${
                  navItems.length === 0
                    ? "cursor-not-allowed border-slate-200 text-slate-300"
                    : "border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600"
                }`}
                data-test-id="builder-add-more-btn"
              >
                <Plus className="w-4 h-4" /> Add another block
              </button>
            </div>
          )}
        </div>
      </div>

      <LayoutPickerDialog
        showLayoutPicker={showLayoutPicker}
        closeLayoutPicker={closeLayoutPicker}
        addBlock={addBlock}
        applyTemplate={applyTemplate}
      />

      <AiPromptDialog
        aiPromptModal={aiPromptModal}
        setAiPromptModal={setAiPromptModal}
        aiWidgetPrompts={aiWidgetPrompts}
        setAiWidgetPrompts={setAiWidgetPrompts}
        aiWidgetLoading={aiWidgetLoading}
        handleGenerateAiWidget={handleGenerateAiWidget}
      />
      <WidgetVariantPickerDialog
        showWidgetVariantPicker={showWidgetVariantPicker}
        closeWidgetVariantPicker={closeWidgetVariantPicker}
        loadingTemplates={loadingTemplates}
        variantTemplates={variantTemplates}
        placeWidget={placeWidget}
        setSelectedSlot={setSelectedSlot}
      />

      <SaveDialog
        saveDialogOpen={saveDialogOpen}
        setSaveDialogOpen={setSaveDialogOpen}
        dashboardName={dashboardName}
        setDashboardName={setDashboardName}
        savingLayout={savingLayout}
        handleSave={handleSave}
      />

      <WidgetCategoryPickerDialog
        widgetCategoryModalOpen={widgetCategoryModalOpen}
        closeWidgetCategoryModal={closeWidgetCategoryModal}
        setSelectedSlot={setSelectedSlot}
        widgetTemplates={widgetTemplates}
        customWidgetCount={customWidgetTemplates.length}
        loadingTemplates={loadingTemplates}
        handleCategoryClick={handleCategoryClick}
      />

      {/* ── Modal: Code Editor (CSS / Data / Function tabs) ── */}
      <BuilderCodeEditorDialog
        cssEditorState={cssEditorState}
        closeCssEditor={closeCssEditor}
        setDataJsonError={setDataJsonError}
        codeEditorTab={codeEditorTab}
        setCodeEditorTab={setCodeEditorTab}
        cssEditorDraft={cssEditorDraft}
        setCssEditorDraft={setCssEditorDraft}
        dataEditorDraft={dataEditorDraft}
        setDataEditorDraft={setDataEditorDraft}
        functionEditorDraft={functionEditorDraft}
        setFunctionEditorDraft={setFunctionEditorDraft}
        dataJsonError={dataJsonError}
        saveCssStyles={saveCssStyles}
        saveWidgetDataFromEditor={saveWidgetDataFromEditor}
        saveWidgetFunctionFromEditor={saveWidgetFunctionFromEditor}
      />

      <GridPlyaGroundModal
        open={!!gridRatioModal}
        block={selectedGridBlock}
        onClose={closeGridRatioModal}
        onApply={(blockId, settings) => {
          saveGridRatio(blockId, settings);
        }}
      />

      <BuilderAiChatPanel
        groqChatOpen={groqChatOpen}
        groqChatContext={groqChatContext}
        groqMessages={groqMessages}
        groqChatLoading={groqChatLoading}
        closeGroqChat={closeGroqChat}
        groqInputRef={groqInputRef}
        groqInput={groqInput}
        setGroqInput={setGroqInput}
        slashMenuOpen={slashMenuOpen}
        setSlashMenuOpen={setSlashMenuOpen}
        slashMenuHighlighted={slashMenuHighlighted}
        setSlashMenuHighlighted={setSlashMenuHighlighted}
        sendGroqMessage={sendGroqMessage}
      />

      <NavItemDialog
        navItemModalOpen={navItemModalOpen}
        closeNavItemModal={closeNavItemModal}
        navItemLabel={navItemLabel}
        setNavItemLabel={setNavItemLabel}
        addingNavItem={addingNavItem}
        handleAddNavItem={handleAddNavItem}
      />
    </div>
  );
}
