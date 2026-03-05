"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type {
  LayoutType,
  LayoutBlock,
  PlacedWidget,
  WidgetTypePicker,
  WidgetVariantPicker,
  NavItem,
  BlockStyleEditorState,
  GroqStyleContext,
  GroqChatMessage,
  CodeEditorTab,
} from "@/domain/builder/types";
import type { WidgetTemplate } from "@/domain/widgets/types";
import { saveLayout as saveLayoutApi, getWidgets } from "@/lib/api/builder-layouts";
import { createNavItem, getNavItems, deleteNavItem } from "@/lib/api/builder-nav";
import { saveBlockStyles, generateAiStyle, generateAiWidgetUpdate, saveWidgetData as saveWidgetDataApi, saveGridRatio as saveGridRatioApi } from "@/lib/api/builder-styles";
import type { DashboardTemplate } from "@/lib/dashboard-templates";

export const BUILDER_CATEGORIES = [
  "stats",
  "charts",
  "progress",
  "activity",
  "health",
  "timeline",
  "table",
  "funnel",
  "leaderboard",
  "summary",
] as const;

export function mergeCss(existing: string, incoming: string): string {
  console.log(`Debug flow: mergeCss fired with`, { existingLen: existing.length, incomingLen: incoming.length });
  const toMap = (css: string): Map<string, string> => {
    const map = new Map<string, string>();
    css.split(";").forEach((decl) => {
      const colonIdx = decl.indexOf(":");
      if (colonIdx === -1) return;
      const prop = decl.slice(0, colonIdx).trim();
      const val = decl.slice(colonIdx + 1).trim();
      if (prop) map.set(prop, val);
    });
    return map;
  };
  const merged = new Map([...toMap(existing), ...toMap(incoming)]);
  const result = Array.from(merged.entries())
    .filter(([, v]) => v && v.trim())
    .map(([p, v]) => `${p}: ${v}`)
    .join("; ");
  console.log(`Debug flow: mergeCss result`, { resultLen: result.length });
  return result;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function slotCount(type: LayoutType): number {
  console.log(`Debug flow: slotCount fired with`, { type });
  switch (type) {
    case "single": return 1;
    case "grid-2": return 2;
    case "grid-3": return 3;
    case "grid-4": return 4;
  }
}

type BlockDef = { type: LayoutType; slots: (PlacedWidget | null)[] };

const w = (widgetId: string, category: PlacedWidget["category"], title: string, widgetData: Record<string, unknown> = {}): PlacedWidget => ({
  widgetId,
  category,
  title,
  widgetData,
});

const TEMPLATE_BLOCK_MAP: Record<string, BlockDef[]> = {
  "metrics-overview": [
    {
      type: "grid-4",
      slots: [
        w("revenue-kpi",      "stats",  "Total Revenue",    { value: "$45,231", label: "Total Revenue",    trend: "+12.5%", trendUp: true,  period: "This month" }),
        w("user-growth",      "stats",  "Active Users",     { value: "12,543",  label: "Active Users",     trend: "+8.2%",  trendUp: true,  period: "This week"  }),
        w("conversion-rate",  "stats",  "Conversion Rate",  { value: "3.24%",   label: "Conversion Rate",  trend: "-1.2%",  trendUp: false, period: "vs last week" }),
        w("sparkline",        "stats",  "Page Views",       { value: "2,543",   label: "Page Views",       bars: [30,45,35,60,50,70,65,80,75,85,90,95], period: "Today" }),
      ],
    },
    {
      type: "single",
      slots: [
        w("revenue-chart", "charts", "Monthly Revenue", { title: "Monthly Revenue", bars: [50,65,80,100,75,90,88,95], labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"] }),
      ],
    },
  ],

  "split-dashboard": [
    {
      type: "grid-2",
      slots: [
        w("revenue-kpi",  "stats", "Total Revenue", { value: "$45,231", label: "Total Revenue", trend: "+12.5%", trendUp: true, period: "This month" }),
        w("user-growth",  "stats", "Active Users",  { value: "12,543",  label: "Active Users",  trend: "+8.2%",  trendUp: true, period: "This week"  }),
      ],
    },
    {
      type: "single",
      slots: [
        w("revenue-chart", "charts", "Revenue Overview", { title: "Revenue Overview", bars: [50,65,80,100,75,90], labels: ["Jan","Feb","Mar","Apr","May","Jun"] }),
      ],
    },
    {
      type: "single",
      slots: [
        w("orders-table", "table", "Recent Orders"),
      ],
    },
  ],

  "grid-dashboard": [
    {
      type: "grid-3",
      slots: [
        w("revenue-kpi",     "stats", "Total Revenue",   { value: "$45,231", label: "Total Revenue",   trend: "+12.5%", trendUp: true,  period: "This month" }),
        w("user-growth",     "stats", "Active Users",    { value: "12,543",  label: "Active Users",    trend: "+8.2%",  trendUp: true,  period: "This week"  }),
        w("conversion-rate", "stats", "Conversion Rate", { value: "3.24%",   label: "Conversion Rate", trend: "-1.2%",  trendUp: false, period: "vs last week" }),
      ],
    },
    {
      type: "grid-3",
      slots: [
        w("sparkline",    "stats", "Page Views",  { value: "2,543", label: "Page Views", bars: [30,45,35,60,50,70,65,80], period: "Today" }),
        w("mrr",          "stats", "MRR",         { value: "$89,200", label: "Monthly Recurring Revenue", trend: "+15.8%", trendUp: true, period: "This month" }),
        w("satisfaction", "stats", "Satisfaction",{ value: "4.8", label: "Customer Satisfaction", filledStars: 4, reviews: 1234 }),
      ],
    },
  ],

  "analytics-dashboard": [
    {
      type: "single",
      slots: [
        w("line-trend", "charts", "Revenue Trend", { title: "Revenue Trend", points: [20,35,28,45,38,55,48,62,55,70,65,78], labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] }),
      ],
    },
    {
      type: "grid-4",
      slots: [
        w("revenue-kpi",     "stats", "Total Revenue",   { value: "$45,231", label: "Total Revenue",   trend: "+12.5%", trendUp: true,  period: "This month" }),
        w("user-growth",     "stats", "Active Users",    { value: "12,543",  label: "Active Users",    trend: "+8.2%",  trendUp: true,  period: "This week"  }),
        w("conversion-rate", "stats", "Conversion Rate", { value: "3.24%",   label: "Conversion Rate", trend: "-1.2%",  trendUp: false, period: "vs last week" }),
        w("realtime-users",  "stats", "Live Users",      { value: "1,234",   label: "Active Users Now", period: "Online right now", live: true }),
      ],
    },
  ],

  "monitoring-dashboard": [
    {
      type: "single",
      slots: [
        w("revenue-chart",  "charts", "Monthly Revenue",  { title: "Monthly Revenue",  bars: [50,65,80,100,75,90,88,95], labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"] }),
      ],
    },
    {
      type: "single",
      slots: [
        w("activity-chart", "charts", "User Activity",    { title: "User Activity",    bars: [40,60,45,80,55,70,65,85,75,90,80,95] }),
      ],
    },
    {
      type: "single",
      slots: [
        w("traffic-pie",    "charts", "Traffic Sources",  { title: "Traffic Sources",  segments: [{ label: "Direct", value: "45%", pct: 45, color: "#6366f1" }, { label: "Organic", value: "30%", pct: 30, color: "#a855f7" }, { label: "Social", value: "25%", pct: 25, color: "#ec4899" }] }),
      ],
    },
  ],

  "kpi-dashboard": [
    {
      type: "grid-2",
      slots: [
        w("revenue-kpi",    "stats",  "Total Revenue",  { value: "$45,231", label: "Total Revenue",  trend: "+12.5%", trendUp: true, period: "This month" }),
        w("revenue-chart",  "charts", "Revenue Chart",  { title: "Revenue Chart", bars: [50,65,80,100,75,90], labels: ["Jan","Feb","Mar","Apr","May","Jun"] }),
      ],
    },
    {
      type: "grid-2",
      slots: [
        w("user-growth",    "stats",  "Active Users",   { value: "12,543", label: "Active Users",  trend: "+8.2%", trendUp: true, period: "This week" }),
        w("activity-chart", "charts", "Activity Chart", { title: "Activity Chart", bars: [40,60,45,80,55,70,65,85] }),
      ],
    },
  ],
};

function buildLog(message: string, metadata: Record<string, unknown> = {}) {
  console.log(`[builder-trace] ${message}`, metadata);
  fetch("/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level: "debug", category: "builder-trace", message, metadata }),
  }).catch(() => {});
}

export function useBuilder() {
  console.log(`Debug flow: useBuilder fired with`, { timestamp: new Date().toISOString() });

  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";

  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [navItemModalOpen, setNavItemModalOpen] = useState(false);
  const [addingNavItem, setAddingNavItem] = useState(false);
  const [loadingNavItems, setLoadingNavItems] = useState(true);
  const [widgetCategoryModalOpen, setWidgetCategoryModalOpen] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [showWidgetTypePicker, setShowWidgetTypePicker] = useState<WidgetTypePicker | null>(null);
  const [showWidgetVariantPicker, setShowWidgetVariantPicker] = useState<WidgetVariantPicker | null>(null);
  const [widgetTemplates, setWidgetTemplates] = useState<WidgetTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [savingLayout, setSavingLayout] = useState(false);
  const [cssEditorState, setCssEditorState] = useState<BlockStyleEditorState | null>(null);
  const [codeEditorTab, setCodeEditorTab] = useState<CodeEditorTab>("css");
  const [dataEditorDraft, setDataEditorDraft] = useState("");
  const [functionEditorDraft, setFunctionEditorDraft] = useState("");
  const [groqChatOpen, setGroqChatOpen] = useState(false);
  const [groqChatContext, setGroqChatContext] = useState<GroqStyleContext | null>(null);
  const [groqMessages, setGroqMessages] = useState<GroqChatMessage[]>([]);
  const [groqChatLoading, setGroqChatLoading] = useState(false);
  const [cssStateHistory, setCssStateHistory] = useState<string[]>([]);
  const [layoutId, setLayoutId] = useState<string | null>(null);
  const [dataJsonError, setDataJsonError] = useState<string | null>(null);
  const [gridRatioModal, setGridRatioModal] = useState<{blockId: string} | null>(null);

  useEffect(() => {
    console.log(`Debug flow: useBuilder useEffect fired — loading nav items`, { projectId });
    if (!projectId) {
      setLoadingNavItems(false);
      return;
    }
    const load = async () => {
      setLoadingNavItems(true);
      const data = await getNavItems(projectId);
      if (data.ok && data.items) {
        console.log(`Debug flow: useBuilder nav items loaded`, { count: data.items.length });
        setNavItems(data.items);
      }
      setLoadingNavItems(false);
    };
    load();
  }, [projectId]);

  useEffect(() => {
    console.log(`Debug flow: useBuilder useEffect fired — loading widget templates`);
    const loadTemplates = async () => {
      try {
        const data = await getWidgets();
        const templates: WidgetTemplate[] = (data.widgets ?? []).map(
          (w: Omit<WidgetTemplate, "widgetData"> & { jsxCode?: string }) => ({
            ...w,
            widgetData: (() => {
              try { return JSON.parse(w.jsxCode ?? "{}"); } catch { return {}; }
            })(),
          })
        );
        console.log(`Debug flow: useBuilder templates loaded`, { count: templates.length });
        setWidgetTemplates(templates);
      } catch (err) {
        console.error(`Debug flow: useBuilder template load error`, err);
      } finally {
        setLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, []);

  const openLayoutPicker = () => {
    console.log(`Debug flow: openLayoutPicker fired`);
    setShowLayoutPicker(true);
  };

  const closeLayoutPicker = () => {
    console.log(`Debug flow: closeLayoutPicker fired`);
    setShowLayoutPicker(false);
  };

  const addBlock = (type: LayoutType) => {
    console.log(`Debug flow: addBlock fired with`, { type });
    const block: LayoutBlock = {
      id: generateId(),
      type,
      slots: Array.from({ length: slotCount(type) }, () => null),
    };
    setBlocks((prev) => [...prev, block]);
    setShowLayoutPicker(false);
  };

  const removeBlock = (blockId: string) => {
    console.log(`Debug flow: removeBlock fired with`, { blockId });
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const openWidgetTypePicker = (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: openWidgetTypePicker fired with`, { blockId, slotIdx });
    setShowWidgetTypePicker({ blockId, slotIdx });
  };

  const closeWidgetTypePicker = () => {
    console.log(`Debug flow: closeWidgetTypePicker fired`);
    setShowWidgetTypePicker(null);
  };

  const openWidgetVariantPicker = (blockId: string, slotIdx: number, category: string) => {
    console.log(`Debug flow: openWidgetVariantPicker fired with`, { blockId, slotIdx, category });
    setShowWidgetTypePicker(null);
    setShowWidgetVariantPicker({ blockId, slotIdx, category });
  };

  const closeWidgetVariantPicker = () => {
    console.log(`Debug flow: closeWidgetVariantPicker fired`);
    setShowWidgetVariantPicker(null);
  };

  const placeWidget = (blockId: string, slotIdx: number, template: WidgetTemplate) => {
    console.log(`Debug flow: placeWidget fired with`, { blockId, slotIdx, slug: template.slug });
    const placed: PlacedWidget = {
      widgetId: template.slug,
      category: template.category,
      title: template.title,
      widgetData: template.widgetData ?? {},
    };
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const newSlots = [...b.slots];
        newSlots[slotIdx] = placed;
        return { ...b, slots: newSlots };
      })
    );
    setShowWidgetVariantPicker(null);
  };

  const removeWidget = (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: removeWidget fired with`, { blockId, slotIdx });
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const newSlots = [...b.slots];
        newSlots[slotIdx] = null;
        return { ...b, slots: newSlots };
      })
    );
  };

  const applyTemplate = (template: DashboardTemplate) => {
    buildLog("applyTemplate:ENTER", { templateId: template.id, templateName: template.name });

    const blockDefs = TEMPLATE_BLOCK_MAP[template.id];
    buildLog("applyTemplate:TEMPLATE_BLOCK_MAP_LOOKUP", {
      templateId: template.id,
      found: !!blockDefs,
      blockDefCount: blockDefs?.length ?? 0,
    });

    if (!blockDefs || blockDefs.length === 0) {
      buildLog("applyTemplate:NO_BLOCK_DEFS_FOUND", { templateId: template.id });
      return;
    }

    blockDefs.forEach((def, defIdx) => {
      buildLog(`applyTemplate:BLOCK_DEF[${defIdx}]`, {
        type: def.type,
        slotCount: def.slots.length,
        slots: def.slots.map((s, si) => ({
          slotIdx: si,
          isNull: s === null,
          widgetId: s?.widgetId ?? null,
          category: s?.category ?? null,
          title: s?.title ?? null,
          hasWidgetData: s?.widgetData ? Object.keys(s.widgetData).length > 0 : false,
        })),
      });
    });

    const newBlocks: LayoutBlock[] = blockDefs.map((def) => ({
      id: generateId(),
      type: def.type,
      slots: def.slots.map(() => null),
    }));

    buildLog("applyTemplate:NEW_BLOCKS_CREATED", {
      templateId: template.id,
      blocksCreated: newBlocks.length,
      blockSummary: newBlocks.map((b) => ({
        id: b.id,
        type: b.type,
        slotCount: b.slots.length,
        populatedSlots: b.slots.filter((s) => s !== null).length,
        emptySlots: b.slots.filter((s) => s === null).length,
      })),
    });

    setBlocks((prev) => {
      const result = [...prev, ...newBlocks];
      buildLog("applyTemplate:SET_BLOCKS", {
        prevBlockCount: prev.length,
        newBlockCount: newBlocks.length,
        totalBlockCount: result.length,
      });
      return result;
    });
    setShowLayoutPicker(false);

    buildLog("applyTemplate:EXIT", { templateId: template.id, blocksCreated: newBlocks.length });
  };

  const generateAiWidget = async (blockId: string, slotIdx: number, prompt: string): Promise<{ ok: boolean; error?: string }> => {
    const timestamp = new Date().toISOString();
    const logEntry = (msg: string, data?: unknown) => {
      const logLine = `[${timestamp}] useBuilder.generateAiWidget - ${msg}${data ? ': ' + JSON.stringify(data) : ''}`;
      console.log(logLine);
    };

    logEntry('START', { blockId, slotIdx, prompt });
    try {
      const res = await fetch("/api/builder/ai-widget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      logEntry('API Response received', { ok: data.ok, widgetId: data.widget?.widgetId, hasError: !!data.error });

      if (!data.ok || !data.widget) {
        logEntry('ERROR: Invalid response', { error: data.error });
        return { ok: false, error: data.error ?? "Failed to generate widget" };
      }

      const placed: PlacedWidget = {
        widgetId: data.widget.widgetId,
        category: data.widget.category,
        title: data.widget.title,
        widgetData: data.widget.widgetData,
      };

      logEntry('Widget created, updating state', {
        widgetId: placed.widgetId,
        category: placed.category,
        widgetDataKeys: Object.keys(placed.widgetData),
        widgetDataSample: JSON.stringify(placed.widgetData).substring(0, 200)
      });

      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          const newSlots = [...b.slots];
          newSlots[slotIdx] = placed;
          return { ...b, slots: newSlots };
        })
      );

      logEntry('SUCCESS: Widget placed in state', { blockId, slotIdx });
      return { ok: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      logEntry('EXCEPTION', { error: errorMsg, stack: err instanceof Error ? err.stack : '' });
      return { ok: false, error: errorMsg };
    }
  };

  const openNavItemModal = () => {
    console.log(`Debug flow: openNavItemModal fired`);
    setNavItemModalOpen(true);
  };

  const closeNavItemModal = () => {
    console.log(`Debug flow: closeNavItemModal fired`);
    setNavItemModalOpen(false);
  };

  const openGridRatioModal = (blockId: string) => {
    console.log(`Debug flow: openGridRatioModal fired with`, { blockId });
    setGridRatioModal({ blockId });
  };

  const closeGridRatioModal = () => {
    console.log(`Debug flow: closeGridRatioModal fired`);
    setGridRatioModal(null);
  };

  const saveGridRatio = async (blockId: string, ratio: string) => {
    console.log(`Debug flow: saveGridRatio fired with`, { blockId, ratio });
    const updated = blocks.map(b => b.id === blockId ? { ...b, gridRatio: ratio } : b);
    setBlocks(updated);
    closeGridRatioModal();
    const result = await saveGridRatioApi(blockId, ratio, layoutId ?? undefined, updated);
    if (result.ok && result.layoutId && !layoutId) {
      setLayoutId(result.layoutId);
    }
  };

  const addNavItem = async (label: string): Promise<boolean> => {
    console.log(`Debug flow: addNavItem fired with`, { label, projectId });
    if (!label.trim() || !projectId) return false;
    setAddingNavItem(true);
    try {
      const data = await createNavItem(label.trim(), projectId);
      if (!data.ok || !data.item) throw new Error(data.error ?? "Failed to create nav item");
      console.log(`Debug flow: addNavItem saved`, { id: data.item.id });
      setNavItems((prev) => [...prev, data.item!]);
      return true;
    } catch (err) {
      console.error(`Debug flow: addNavItem error`, err);
      return false;
    } finally {
      setAddingNavItem(false);
    }
  };

  const removeNavItem = async (itemId: string): Promise<boolean> => {
    console.log(`Debug flow: removeNavItem fired with`, { itemId, projectId });
    if (!projectId) return false;
    try {
      const data = await deleteNavItem(itemId, projectId);
      if (!data.ok) throw new Error(data.error ?? "Failed to delete nav item");
      console.log(`Debug flow: removeNavItem deleted`, { itemId });
      setNavItems((prev) => prev.filter((item) => item.id !== itemId));
      return true;
    } catch (err) {
      console.error(`Debug flow: removeNavItem error`, err);
      return false;
    }
  };

  const openCssEditor = (blockId: string, slotIdx?: number) => {
    const block = blocks.find((b) => b.id === blockId);
    const isBlockLevel = slotIdx === undefined || slotIdx === -1;

    const currentCss = isBlockLevel
      ? block?.blockStyles ?? ""  // Block-level CSS
      : block?.columnStyles?.[slotIdx] ?? "";  // Slot/column CSS

    const widget = !isBlockLevel ? block?.slots[slotIdx ?? 0] ?? null : null;

    const editorState: BlockStyleEditorState = {
      blockId,
      slotIdx: slotIdx ?? -1,  // -1 indicates block-level editing
      css: currentCss,
      widgetId: widget?.widgetId,
      widgetTitle: widget?.title,
      widgetCategory: widget?.category,
      widgetData: widget?.widgetData,
      functionCode: widget?.functionCode,
    };

    const editingWhat = isBlockLevel
      ? `block "${block?.type}" container styles`
      : widget?.title
        ? `column ${(slotIdx ?? 0) + 1} with widget "${widget.title}"`
        : `column ${(slotIdx ?? 0) + 1} styles`;

    console.log(`[Editor] Opening CSS editor for:`, { blockId, slotIdx: slotIdx ?? 'block-level', editingWhat });

    setCssEditorState(editorState);
    setCodeEditorTab("css");
    setDataEditorDraft(widget?.widgetData ? JSON.stringify(widget.widgetData, null, 2) : "");
    setFunctionEditorDraft(widget?.functionCode ?? "");
  };

  const closeCssEditor = () => {
    console.log(`Debug flow: closeCssEditor fired`);
    setCssEditorState(null);
  };

  const saveCssStyles = async (css: string) => {
    console.log(`Debug flow: saveCssStyles fired with`, { css, state: cssEditorState });
    if (!cssEditorState) return;
    const { blockId, slotIdx } = cssEditorState;
    const isBlockLevel = slotIdx === -1;

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;

        if (isBlockLevel) {
          // Save block-level CSS
          console.log(`[Styles] Saving block-level CSS`, { blockId, css });
          return { ...b, blockStyles: css };
        } else {
          // Save column/slot CSS
          const styles = b.columnStyles ? [...b.columnStyles] : Array.from({ length: b.slots.length }, () => "");
          while (styles.length <= slotIdx) styles.push("");
          styles[slotIdx] = css;
          console.log(`[Styles] Saving column CSS`, { blockId, slotIdx, css });
          return { ...b, columnStyles: styles };
        }
      })
    );

    const result = await saveBlockStyles(blockId, isBlockLevel ? -1 : slotIdx, css, layoutId ?? undefined, blocks);
    if (result.ok && result.layoutId && !layoutId) {
      console.log(`Debug flow: saveCssStyles captured layoutId`, { layoutId: result.layoutId });
      setLayoutId(result.layoutId);
    }
    setCssEditorState(null);
  };

  const saveWidgetDataFromEditor = async (widgetDataStr: string, fnCode: string): Promise<string | null> => {
    console.log(`Debug flow: saveWidgetDataFromEditor fired with`, { state: cssEditorState, fnCodeLen: fnCode.length });
    if (!cssEditorState) return null;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(widgetDataStr) as Record<string, unknown>;
    } catch {
      console.error(`Debug flow: saveWidgetDataFromEditor JSON parse error`);
      return "Invalid JSON — please check your syntax.";
    }
    const { blockId, slotIdx } = cssEditorState;
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const newSlots = [...b.slots];
        const existing = newSlots[slotIdx];
        if (existing) {
          newSlots[slotIdx] = { ...existing, widgetData: parsed, functionCode: fnCode || undefined };
        }
        return { ...b, slots: newSlots };
      })
    );
    await saveWidgetDataApi(blockId, slotIdx, parsed, fnCode || undefined, layoutId ?? undefined);
    console.log(`Debug flow: saveWidgetDataFromEditor complete`, { blockId, slotIdx });
    return null;
  };

  const openGroqChat = (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: openGroqChat fired with`, { blockId, slotIdx });
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const widget = block.slots[slotIdx];
    const initialCss = block.columnStyles?.[slotIdx] ?? "";
    const context: GroqStyleContext = {
      blockId,
      slotIdx,
      currentCss: initialCss,
      blockType: block.type,
      widget: widget ? {
        widgetId: widget.widgetId,
        category: widget.category,
        title: widget.title,
        widgetData: widget.widgetData,
      } : undefined,
    };
    setGroqChatContext(context);
    setGroqMessages([]);
    setCssStateHistory([initialCss]);
    setGroqChatOpen(true);
  };

  const closeGroqChat = () => {
    console.log(`Debug flow: closeGroqChat fired`);
    setGroqChatOpen(false);
    setGroqChatContext(null);
    setGroqMessages([]);
    setCssStateHistory([]);
  };

  const sendGroqMessage = async (message: string) => {
    console.log(`Debug flow: sendGroqMessage fired with`, { message, context: groqChatContext });
    if (!groqChatContext || !message.trim()) return;

    const messageLower = message.toLowerCase().trim();
    if (messageLower === "revert" || messageLower === "undo") {
      console.log(`Debug flow: Revert command detected`, { historyLength: cssStateHistory.length });
      if (cssStateHistory.length > 1) {
        const newHistory = [...cssStateHistory];
        newHistory.pop();
        const previousCss = newHistory[newHistory.length - 1];
        setCssStateHistory(newHistory);
        
        const { blockId, slotIdx } = groqChatContext;
        setBlocks((prev) =>
          prev.map((b) => {
            if (b.id !== blockId) return b;
            const styles = b.columnStyles ? [...b.columnStyles] : Array.from({ length: b.slots.length }, () => "");
            while (styles.length <= slotIdx) styles.push("");
            styles[slotIdx] = previousCss;
            return { ...b, columnStyles: styles };
          })
        );
        setGroqChatContext((prev) => prev ? { ...prev, currentCss: previousCss } : prev);
        await saveBlockStyles(blockId, slotIdx, previousCss, layoutId ?? undefined, blocks);
        
        setGroqMessages((prev) => [
          ...prev,
          { role: "user", content: message },
          { role: "assistant", content: "Reverted to previous state." }
        ]);
      } else {
        setGroqMessages((prev) => [
          ...prev,
          { role: "user", content: message },
          { role: "assistant", content: "No previous state to revert to." }
        ]);
      }
      return;
    }

    const userMsg: GroqChatMessage = { role: "user", content: message };
    const updatedHistory = [...groqMessages, userMsg];
    setGroqMessages(updatedHistory);
    setGroqChatLoading(true);

    const isStyleRequest =
      messageLower.includes("height") ||
      messageLower.includes("width") ||
      messageLower.includes("padding") ||
      messageLower.includes("margin") ||
      messageLower.includes("background") ||
      messageLower.includes("border") ||
      messageLower.includes("shadow") ||
      messageLower.includes("radius") ||
      messageLower.includes("opacity") ||
      messageLower.includes("flex") ||
      messageLower.includes("align") ||
      messageLower.includes("justify") ||
      messageLower.includes("gap") ||
      messageLower.includes("display") ||
      messageLower.includes("overflow") ||
      messageLower.includes("position") ||
      messageLower.includes("transform") ||
      messageLower.includes("transition") ||
      messageLower.includes("font") ||
      messageLower.includes("text-") ||
      messageLower.includes("style");

    const isWidgetDataUpdate = !isStyleRequest && groqChatContext.widget && (
      messageLower.includes("color") ||
      messageLower.includes("month") ||
      messageLower.includes("label") ||
      messageLower.includes("data") ||
      messageLower.includes("value") ||
      messageLower.includes("bar") ||
      messageLower.includes("segment") ||
      messageLower.includes("chart") ||
      messageLower.includes("complete") ||
      messageLower.includes("add") ||
      messageLower.includes("change title") ||
      messageLower.includes("update")
    );

    console.log(`Debug flow: sendGroqMessage intent detection`, { isStyleRequest, isWidgetDataUpdate, hasWidget: !!groqChatContext.widget });

    try {
      if (isWidgetDataUpdate && groqChatContext.widget) {
        const result = await generateAiWidgetUpdate(
          groqChatContext.blockId,
          groqChatContext.slotIdx,
          groqChatContext.widget.widgetData,
          groqChatContext.widget.widgetId,
          groqChatContext.widget.category,
          message,
          groqMessages
        );

        if (result.ok && result.widgetData) {
          const { blockId, slotIdx } = groqChatContext;
          setBlocks((prev) =>
            prev.map((b) => {
              if (b.id !== blockId) return b;
              const newSlots = [...b.slots];
              const existing = newSlots[slotIdx];
              if (existing) {
                newSlots[slotIdx] = { ...existing, widgetData: result.widgetData! };
              }
              return { ...b, slots: newSlots };
            })
          );
          setGroqChatContext((prev) => prev && prev.widget ? { 
            ...prev, 
            widget: { ...prev.widget, widgetData: result.widgetData! } 
          } : prev);
          await saveWidgetDataApi(blockId, slotIdx, result.widgetData, undefined, layoutId ?? undefined);
          setGroqMessages((prev) => [...prev, { role: "assistant", content: "Widget data updated successfully." }]);
        } else {
          setGroqMessages((prev) => [...prev, { role: "assistant", content: result.error ?? "Failed to update widget data." }]);
        }
      } else {
        const result = await generateAiStyle(
          groqChatContext.blockId,
          groqChatContext.slotIdx,
          groqChatContext.blockType,
          groqChatContext.currentCss,
          message,
          groqMessages,
          groqChatContext.widget
        );
        const assistantContent = result.css ?? "Sorry, could not generate styles.";
        setGroqMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
        if (result.ok && result.css) {
          const { blockId, slotIdx } = groqChatContext;
          const merged = mergeCss(groqChatContext.currentCss, result.css);
          setCssStateHistory((prev) => [...prev, merged]);
          setBlocks((prev) =>
            prev.map((b) => {
              if (b.id !== blockId) return b;
              const styles = b.columnStyles ? [...b.columnStyles] : Array.from({ length: b.slots.length }, () => "");
              while (styles.length <= slotIdx) styles.push("");
              styles[slotIdx] = merged;
              return { ...b, columnStyles: styles };
            })
          );
          setGroqChatContext((prev) => prev ? { ...prev, currentCss: merged } : prev);
          const saveResult = await saveBlockStyles(blockId, slotIdx, merged, layoutId ?? undefined, blocks);
          if (saveResult.ok && saveResult.layoutId && !layoutId) {
            console.log(`Debug flow: sendGroqMessage captured layoutId`, { layoutId: saveResult.layoutId });
            setLayoutId(saveResult.layoutId);
          }
        }
      }
    } catch (err) {
      console.error(`Debug flow: sendGroqMessage error`, err);
      setGroqMessages((prev) => [...prev, { role: "assistant", content: "Error processing request." }]);
    } finally {
      setGroqChatLoading(false);
    }
  };

  const openWidgetCategoryModal = () => {
    console.log(`Debug flow: openWidgetCategoryModal fired`);
    setWidgetCategoryModalOpen(true);
  };

  const closeWidgetCategoryModal = () => {
    console.log(`Debug flow: closeWidgetCategoryModal fired`);
    setWidgetCategoryModalOpen(false);
  };

  const togglePreview = () => {
    console.log(`Debug flow: togglePreview fired`, { previewMode: !previewMode });
    setPreviewMode((prev) => !prev);
  };

  const saveLayout = async (name: string): Promise<string | null> => {
    console.log(`Debug flow: saveLayout fired with`, { name, blockCount: blocks.length });
    setSavingLayout(true);
    try {
      const data = await saveLayoutApi(name.trim() || "My Dashboard", blocks);
      if (!data.ok) throw new Error(data.error ?? "Save failed");
      console.log(`Debug flow: saveLayout saved`, { id: data.layout?.id });
      return data.layout?.id ?? null;
    } catch (err) {
      console.error(`Debug flow: saveLayout error`, err);
      return null;
    } finally {
      setSavingLayout(false);
    }
  };

  const variantTemplates = showWidgetVariantPicker
    ? widgetTemplates.filter((w) => w.category === showWidgetVariantPicker.category)
    : [];

  return {
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
    openWidgetTypePicker,
    closeWidgetTypePicker,
    openWidgetVariantPicker,
    closeWidgetVariantPicker,
    placeWidget,
    removeWidget,
    generateAiWidget,
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
    gridRatioModal,
    openGridRatioModal,
    closeGridRatioModal,
    saveGridRatio,
  };
}
