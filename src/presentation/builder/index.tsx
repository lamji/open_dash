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
    const slotPlacementStyle = getGridPlaygroundSlotPlacement(block, slotIdx);
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
              <div className={`flex items-center ${isCompactSlot ? "flex-col gap-2 items-start" : ""}`}>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Nested layout</p>
                  <p className="text-xs text-slate-500">Child columns stay inside this parent wrapper.</p>
                </div>
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

  const selectedGridBlock = gridRatioModal ? findBlock(blocks, gridRatioModal.blockId) : null;

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
            {!previewMode && (
              <button
                onClick={openNavItemModal}
                disabled={addingNavItem || loadingNavItems}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 border border-dashed border-slate-200 text-xs hover:border-blue-300 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-400"
                data-test-id="builder-sidebar-add-nav-btn"
              >
                {addingNavItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {addingNavItem ? "Adding..." : "Add nav item"}
              </button>
            )}
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
            <EmptyStateSection openLayoutPicker={openLayoutPicker} navItems={navItems} />
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
