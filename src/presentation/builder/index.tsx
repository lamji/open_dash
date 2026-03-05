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
import type { LayoutType, CodeEditorTab } from "@/domain/builder/types";
import { DASHBOARD_TEMPLATES } from "@/lib/dashboard-templates";

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
    openGroqChat,
    closeGroqChat,
    sendGroqMessage,
    applyTemplate,
    generateAiWidget,
  } = useBuilder();

  const [selectedSlot, setSelectedSlot] = useState<{ blockId: string; slotIdx: number } | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [dashboardName, setDashboardName] = useState("My Dashboard");
  const [navItemLabel, setNavItemLabel] = useState("");
  const [cssEditorDraft, setCssEditorDraft] = useState("");
  const [groqInput, setGroqInput] = useState("");
  const [aiWidgetPrompts, setAiWidgetPrompts] = useState<Record<string, string>>({});
  const [aiWidgetLoading, setAiWidgetLoading] = useState<string | null>(null);
  const groqInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log(`Debug flow: groqChatOpen changed`, { groqChatOpen, groqChatLoading });
    if (groqChatOpen && !groqChatLoading) {
      setTimeout(() => groqInputRef.current?.focus(), 0);
    }
  }, [groqChatOpen, groqChatLoading, groqMessages]);

  const handleAddWidget = (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: handleAddWidget fired with`, { blockId, slotIdx });
    setSelectedSlot({ blockId, slotIdx });
    openWidgetCategoryModal();
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

          <div className="space-y-4 w-full" data-test-id="builder-blocks">
            {blocks.map((block) => {
              console.log(`[builder-render] block`, { id: block.id, type: block.type, slotCount: block.slots.length, populatedSlots: block.slots.filter(s => s !== null).length });
              fetch("/api/logs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ level: "debug", category: "builder-render", message: `RENDER_BLOCK`, metadata: { blockId: block.id, blockType: block.type, slotCount: block.slots.length, slots: block.slots.map((s, i) => ({ idx: i, isNull: s === null, widgetId: s?.widgetId ?? null, hasPreview: s ? !!WIDGET_PREVIEWS[s.widgetId] : false })) } }) }).catch(() => {});
              return (
              <div
                key={block.id}
                className=""
                data-test-id={`builder-block-${block.id}`}
              >
                {!previewMode && (
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200" data-test-id={`builder-block-header-${block.id}`}>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {LAYOUT_OPTIONS.find(l => l.type === block.type)?.label ?? block.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          console.log("🔍 debug-log-block-ai", { blockId: block.id, blockType: block.type });
                          openGroqChat(block.id, 0);
                        }}
                        className="text-slate-400 hover:text-purple-500 transition-colors"
                        title="Ask AI to style this block"
                        data-test-id={`builder-block-ai-${block.id}`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { openCssEditor(block.id, 0); setCssEditorDraft(block.columnStyles?.[0] ?? ""); }}
                        className="text-slate-400 hover:text-blue-500 transition-colors"
                        title="Edit block styles"
                        data-test-id={`builder-block-edit-${block.id}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
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
                <div className={`grid gap-4 ${GRID_CLASS[block.type] ?? "grid-cols-1"}`} data-test-id={`builder-block-grid-${block.id}`}>
                  {block.slots.map((widget, slotIdx) => {
                    const slotStyle = cssStringToStyle(block.columnStyles?.[slotIdx] ?? "");
                    const hasCustomStyle = Object.keys(slotStyle).length > 0;
                    return (
                      <div
                        key={slotIdx}
                        className={`relative w-full min-h-[300px] ${widget ? (!hasCustomStyle ? "bg-white rounded-xl shadow-sm border border-slate-200 p-5" : "rounded-xl") : ""} ${!hasCustomStyle && !widget ? "bg-[#ECECEC] rounded-xl" : ""}`}
                        style={slotStyle}
                        data-test-id={`builder-slot-${block.id}-${slotIdx}`}
                      >
                        {widget ? (
                          <div className="h-full" data-test-id={`builder-slot-filled-${block.id}-${slotIdx}`}>
                            {!previewMode && (
                              <div className="flex items-center justify-between mb-2" data-test-id={`builder-slot-header-${block.id}-${slotIdx}`}>
                                <span className="text-xs font-semibold text-slate-500 truncate">{widget.title}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      console.log("🔍 debug-log-jsx", {
                                        blockId: block.id,
                                        slotIdx,
                                        widget: {
                                          widgetId: widget.widgetId,
                                          category: widget.category,
                                          title: widget.title,
                                          widgetData: widget.widgetData,
                                        },
                                        renderedJSX: WIDGET_PREVIEWS[widget.widgetId] 
                                          ? WIDGET_PREVIEWS[widget.widgetId](widget.widgetData)
                                          : null,
                                      });
                                      openGroqChat(block.id, slotIdx);
                                    }}
                                    className="text-slate-400 hover:text-purple-500 flex-shrink-0"
                                    title="Ask AI to style this slot"
                                    data-test-id={`builder-slot-ai-${block.id}-${slotIdx}`}
                                  >
                                    <Sparkles className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => { openCssEditor(block.id, slotIdx); setCssEditorDraft(block.columnStyles?.[slotIdx] ?? ""); }}
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
                            <div className="w-full h-full" data-test-id={`builder-slot-widget-${block.id}-${slotIdx}`}>
                              {WIDGET_PREVIEWS[widget.widgetId]
                                ? WIDGET_PREVIEWS[widget.widgetId](widget.widgetData)
                                : <span className="text-slate-400 text-xs">No preview</span>
                              }
                            </div>
                          </div>
                        ) : (
                          !previewMode && (
                            <>
                              {/* Top-right style/edit buttons */}
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
                                  onClick={(e) => { e.stopPropagation(); openCssEditor(block.id, slotIdx); setCssEditorDraft(block.columnStyles?.[slotIdx] ?? ""); }}
                                  className="text-slate-400 hover:text-blue-500 bg-white/80 backdrop-blur-sm rounded p-1 shadow-sm transition-colors"
                                  title="Edit column styles"
                                  data-test-id={`builder-empty-slot-edit-${block.id}-${slotIdx}`}
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Centered Add Widget + AI prompt */}
                              <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
                                <button
                                  onClick={() => handleAddWidget(block.id, slotIdx)}
                                  className="flex flex-col items-center gap-2 px-6 py-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                                  data-test-id={`builder-slot-add-widget-${block.id}-${slotIdx}`}
                                >
                                  <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                                  </div>
                                  <span className="text-xs font-medium text-slate-400 group-hover:text-blue-600">Add Widget</span>
                                </button>

                                <div className="flex items-center gap-1.5 w-full max-w-[280px]">
                                  <div className="flex-1 relative">
                                    <Input
                                      value={aiWidgetPrompts[`${block.id}-${slotIdx}`] ?? ""}
                                      onChange={(e) => setAiWidgetPrompts((prev) => ({ ...prev, [`${block.id}-${slotIdx}`]: e.target.value }))}
                                      onKeyDown={(e) => { if (e.key === "Enter") handleGenerateAiWidget(block.id, slotIdx); }}
                                      placeholder="Describe a widget…"
                                      className="text-xs h-8 pr-8"
                                      disabled={aiWidgetLoading === `${block.id}-${slotIdx}`}
                                      data-test-id={`builder-slot-ai-prompt-${block.id}-${slotIdx}`}
                                    />
                                  </div>
                                  <Button
                                    size="sm"
                                    className="h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700 flex-shrink-0"
                                    disabled={!aiWidgetPrompts[`${block.id}-${slotIdx}`]?.trim() || aiWidgetLoading === `${block.id}-${slotIdx}`}
                                    onClick={() => handleGenerateAiWidget(block.id, slotIdx)}
                                    data-test-id={`builder-slot-ai-send-${block.id}-${slotIdx}`}
                                  >
                                    {aiWidgetLoading === `${block.id}-${slotIdx}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                  </Button>
                                </div>
                                <p className="text-[10px] text-slate-400">or create with AI prompt</p>
                              </div>
                            </>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
            })}
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

      {/* ── Modal: Widget Variant Picker ── */}
      <Dialog open={!!showWidgetVariantPicker} onOpenChange={closeWidgetVariantPicker}>
        <DialogContent className="max-w-3xl bg-white" data-test-id="builder-variant-picker-modal">
          <DialogHeader>
            <DialogTitle>
              {showWidgetVariantPicker
                ? `Choose a ${WIDGET_CATEGORIES.find(c => c.id === showWidgetVariantPicker.category)?.label ?? showWidgetVariantPicker.category} widget`
                : "Choose widget"}
            </DialogTitle>
          </DialogHeader>
          {loadingTemplates ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm" data-test-id="builder-variant-loading">Loading widgets…</div>
          ) : variantTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2" data-test-id="builder-variant-empty">
              <p className="text-slate-500 text-sm">No widgets found for this category.</p>
              <Badge variant="secondary">Try seeding the DB with widgets</Badge>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2 max-h-[440px] overflow-y-auto pr-1" data-test-id="builder-variant-grid">
              {variantTemplates.map((template) => (
                <button
                  key={template.slug}
                  onClick={() => {
                    if (showWidgetVariantPicker) {
                      placeWidget(showWidgetVariantPicker.blockId, showWidgetVariantPicker.slotIdx, template);
                    }
                    setSelectedSlot(null);
                  }}
                  className="border border-slate-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all text-left group"
                  data-test-id={`builder-widget-variant-${template.slug}`}
                >
                  <div className="p-3 bg-slate-50 overflow-hidden h-28" data-test-id={`builder-widget-variant-preview-${template.slug}`}>
                    {WIDGET_PREVIEWS[template.slug]
                      ? WIDGET_PREVIEWS[template.slug](template.widgetData ?? {})
                      : <div className="flex items-center justify-center h-full text-slate-400 text-xs">Preview</div>
                    }
                  </div>
                  <div className="px-3 py-2 border-t border-slate-100" data-test-id={`builder-widget-variant-info-${template.slug}`}>
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 truncate">{template.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{template.slug}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
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
              {cssEditorState?.widgetTitle
                ? `${cssEditorState.widgetTitle} — Column ${(cssEditorState?.slotIdx ?? 0) + 1}`
                : `styles.css — Column ${(cssEditorState?.slotIdx ?? 0) + 1}`
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
                  <Button size="sm" onClick={() => { saveCssStyles(cssEditorDraft); }} className="bg-blue-600 hover:bg-blue-700 text-white" data-test-id="builder-css-editor-save-btn">
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
                      const err = await saveWidgetDataFromEditor(dataEditorDraft, "");
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
                      const err = await saveWidgetDataFromEditor(dataEditorDraft, functionEditorDraft);
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
                  <p className="text-[10px] opacity-80">{groqChatContext.blockType} · col {groqChatContext.slotIdx + 1}</p>
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

          <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-200">
            <Input
              ref={groqInputRef}
              value={groqInput}
              onChange={(e) => setGroqInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && groqInput.trim()) {
                  sendGroqMessage(groqInput);
                  setGroqInput("");
                }
              }}
              placeholder="e.g. add background red"
              className="flex-1 text-xs h-8"
              data-test-id="builder-ai-chat-input"
              autoFocus
            />
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
