"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import type {
  LayoutType,
  LayoutBlock,
  LayoutSlot,
  PlacedWidget,
  WidgetTypePicker,
  WidgetVariantPicker,
  BlockStyleEditorState,
  GroqStyleContext,
  GroqChatMessage,
  CodeEditorTab,
} from "@/domain/builder/types";
import { BUILDER_CACHE_INVALIDATE_EVENT } from "@/domain/cache/types";
import type { WidgetTemplate } from "@/domain/widgets/types";
import { saveLayout as saveLayoutApi, getWidgets } from "@/lib/api/builder-layouts";
import { createNavItem, getNavItems, deleteNavItem } from "@/lib/api/builder-nav";
import { bootstrapSocketServer, generateAiWidgetRequest, postBuilderLog } from "@/lib/api/builder-runtime";
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
  "button",
  "dropdown",
  "menu",
  "search",
  "form",
] as const;

const LEGACY_GROUPED_BUTTON_WIDGETS = new Set(["upload-buttons", "button-variant-set"]);

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

function createEmptySlot(): LayoutSlot {
  console.log(`Debug flow: createEmptySlot fired with`, {});
  return { widget: null, childBlocks: [] };
}

function createEmptySlots(type: LayoutType): LayoutSlot[] {
  console.log(`Debug flow: createEmptySlots fired with`, { type });
  return Array.from({ length: slotCount(type) }, () => createEmptySlot());
}

function createBlock(type: LayoutType): LayoutBlock {
  console.log(`Debug flow: createBlock fired with`, { type });
  return {
    id: generateId(),
    type,
    slots: createEmptySlots(type),
    gap: "16px",
    layoutDisplay: "grid",
    justifyContent: "start",
    alignItems: "stretch",
  };
}

function normalizeSlot(slot: LayoutSlot | PlacedWidget | null): LayoutSlot {
  console.log(`Debug flow: normalizeSlot fired with`, { hasSlot: !!slot });
  if (!slot) return createEmptySlot();
  if ("widget" in slot) {
    return {
      widget: slot.widget,
      childBlocks: normalizeBlocks(slot.childBlocks ?? []),
    };
  }
  return {
    widget: slot,
    childBlocks: [],
  };
}

function normalizeBlocks(blocks: LayoutBlock[]): LayoutBlock[] {
  console.log(`Debug flow: normalizeBlocks fired with`, { blockCount: blocks.length });
  return blocks.map((block) => ({
    ...block,
    slots: block.slots.map((slot) => normalizeSlot(slot as LayoutSlot | PlacedWidget | null)),
    gap: block.gap ?? "16px",
    layoutDisplay: block.layoutDisplay ?? "grid",
    justifyContent: block.justifyContent ?? "start",
    alignItems: block.alignItems ?? "stretch",
  }));
}

function findBlockInTree(blocks: LayoutBlock[], blockId: string): LayoutBlock | null {
  console.log(`Debug flow: findBlockInTree fired with`, { blockId, blockCount: blocks.length });
  for (const block of blocks) {
    if (block.id === blockId) {
      return block;
    }
    for (const slot of block.slots) {
      const found = findBlockInTree(slot.childBlocks ?? [], blockId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function updateBlockInTree(
  blocks: LayoutBlock[],
  blockId: string,
  updater: (block: LayoutBlock) => LayoutBlock
): { blocks: LayoutBlock[]; updated: boolean } {
  console.log(`Debug flow: updateBlockInTree fired with`, { blockId, blockCount: blocks.length });
  let updated = false;
  const nextBlocks = blocks.map((block) => {
    if (block.id === blockId) {
      updated = true;
      return updater(block);
    }

    let childUpdated = false;
    const nextSlots = block.slots.map((slot) => {
      const childBlocks = slot.childBlocks ?? [];
      if (childBlocks.length === 0) {
        return slot;
      }
      const result = updateBlockInTree(childBlocks, blockId, updater);
      if (!result.updated) {
        return slot;
      }
      childUpdated = true;
      return { ...slot, childBlocks: result.blocks };
    });

    if (!childUpdated) {
      return block;
    }

    updated = true;
    return { ...block, slots: nextSlots };
  });

  return { blocks: updated ? nextBlocks : blocks, updated };
}

function removeBlockFromTree(blocks: LayoutBlock[], blockId: string): LayoutBlock[] {
  console.log(`Debug flow: removeBlockFromTree fired with`, { blockId, blockCount: blocks.length });
  return blocks
    .filter((block) => block.id !== blockId)
    .map((block) => ({
      ...block,
      slots: block.slots.map((slot) => ({
        ...slot,
        childBlocks: removeBlockFromTree(slot.childBlocks ?? [], blockId),
      })),
    }));
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
  void postBuilderLog(message, metadata).catch(() => {});
}

function mapWidgetTemplates(
  widgets: (Omit<WidgetTemplate, "widgetData"> & { jsxCode?: string })[]
): WidgetTemplate[] {
  console.log(`Debug flow: mapWidgetTemplates fired with`, { count: widgets.length });
  return widgets.map((w) => ({
    ...w,
    widgetData: (() => {
      try { return JSON.parse(w.jsxCode ?? "{}"); } catch { return {}; }
    })(),
  }));
}

export function useBuilder() {
  console.log(`Debug flow: useBuilder fired with`, { timestamp: new Date().toISOString() });

  const searchParams = useSearchParams();
  const projectId = searchParams?.get("projectId") ?? "";
  const queryClient = useQueryClient();
  const navItemsQueryKey = ["builder-nav-items", projectId] as const;
  const widgetTemplatesQueryKey = ["builder-widget-templates"] as const;

  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [navItemModalOpen, setNavItemModalOpen] = useState(false);
  const [addingNavItem, setAddingNavItem] = useState(false);
  const [widgetCategoryModalOpen, setWidgetCategoryModalOpen] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [layoutInsertTarget, setLayoutInsertTarget] = useState<WidgetTypePicker | null>(null);
  const [showWidgetTypePicker, setShowWidgetTypePicker] = useState<WidgetTypePicker | null>(null);
  const [showWidgetVariantPicker, setShowWidgetVariantPicker] = useState<WidgetVariantPicker | null>(null);
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

  const navItemsQuery = useQuery({
    queryKey: navItemsQueryKey,
    queryFn: async () => {
      console.log(`Debug flow: navItemsQuery queryFn fired with`, { projectId });
      const data = await getNavItems(projectId);
      if (!data.ok || !data.items) {
        throw new Error(data.error ?? "Failed to load nav items");
      }
      return data.items;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });

  const widgetTemplatesQuery = useQuery({
    queryKey: widgetTemplatesQueryKey,
    queryFn: async () => {
      console.log(`Debug flow: widgetTemplatesQuery queryFn fired with`, {});
      const data = await getWidgets();
      return mapWidgetTemplates(data.widgets ?? []);
    },
    staleTime: 5 * 60 * 1000,
  });

  const navItems = navItemsQuery.data ?? [];
  const widgetTemplates = widgetTemplatesQuery.data ?? [];
  const loadingNavItems = !!projectId && navItemsQuery.isLoading;
  const loadingTemplates = widgetTemplatesQuery.isLoading;

  useEffect(() => {
    console.log(`Debug flow: useBuilder socket subscription fired with`, { projectId });
    const currentNavItemsQueryKey = ["builder-nav-items", projectId] as const;
    const currentWidgetTemplatesQueryKey = ["builder-widget-templates"] as const;
    void bootstrapSocketServer().catch((err) => {
      console.error(`Debug flow: useBuilder socket bootstrap error`, err);
    });

    const socket = io({
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    socket.on("connect", () => {
      console.log(`Debug flow: useBuilder socket connect fired with`, {
        projectId,
        socketId: socket.id,
      });
    });

    socket.on(BUILDER_CACHE_INVALIDATE_EVENT, (event: { key?: string }) => {
      console.log(`Debug flow: useBuilder socket invalidate fired with`, { event, projectId });
      if (event.key === `sidebar:${projectId}`) {
        void queryClient.invalidateQueries({ queryKey: currentNavItemsQueryKey });
      }
      if (event.key === "widgets:all") {
        void queryClient.invalidateQueries({ queryKey: currentWidgetTemplatesQueryKey });
      }
    });

    return () => {
      console.log(`Debug flow: useBuilder socket cleanup fired with`, { projectId });
      socket.close();
    };
  }, [projectId, queryClient]);

  const openLayoutPicker = () => {
    console.log(`Debug flow: openLayoutPicker fired`);
    setLayoutInsertTarget(null);
    setShowLayoutPicker(true);
  };

  const openSlotLayoutPicker = (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: openSlotLayoutPicker fired with`, { blockId, slotIdx });
    setLayoutInsertTarget({ blockId, slotIdx });
    setShowLayoutPicker(true);
  };

  const closeLayoutPicker = () => {
    console.log(`Debug flow: closeLayoutPicker fired`, { layoutInsertTarget });
    setLayoutInsertTarget(null);
    setShowLayoutPicker(false);
  };

  const addBlock = (type: LayoutType) => {
    console.log(`Debug flow: addBlock fired with`, { type, layoutInsertTarget });
    const block = createBlock(type);
    setBlocks((prev) => {
      const normalizedPrev = normalizeBlocks(prev);
      if (!layoutInsertTarget) {
        return [...normalizedPrev, block];
      }
      const result = updateBlockInTree(normalizedPrev, layoutInsertTarget.blockId, (candidate) => {
        const nextSlots = [...candidate.slots];
        const targetSlot = nextSlots[layoutInsertTarget.slotIdx] ?? createEmptySlot();
        nextSlots[layoutInsertTarget.slotIdx] = {
          ...targetSlot,
          childBlocks: [...(targetSlot.childBlocks ?? []), block],
        };
        return { ...candidate, slots: nextSlots };
      });
      return result.updated ? result.blocks : [...normalizedPrev, block];
    });
    setLayoutInsertTarget(null);
    setShowLayoutPicker(false);
  };

  const removeBlock = (blockId: string) => {
    console.log(`Debug flow: removeBlock fired with`, { blockId });
    setBlocks((prev) => removeBlockFromTree(normalizeBlocks(prev), blockId));
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
    setBlocks((prev) => {
      const result = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
        const newSlots = [...block.slots];
        const existingSlot = newSlots[slotIdx] ?? createEmptySlot();
        newSlots[slotIdx] = { ...existingSlot, widget: placed };
        return { ...block, slots: newSlots };
      });
      return result.blocks;
    });
    setShowWidgetVariantPicker(null);
  };

  const removeWidget = (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: removeWidget fired with`, { blockId, slotIdx });
    setBlocks((prev) => {
      const result = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
        const newSlots = [...block.slots];
        const existingSlot = newSlots[slotIdx] ?? createEmptySlot();
        newSlots[slotIdx] = { ...existingSlot, widget: null };
        return { ...block, slots: newSlots };
      });
      return result.blocks;
    });
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

    const newBlocks: LayoutBlock[] = blockDefs.map((def) => createBlock(def.type));

    buildLog("applyTemplate:NEW_BLOCKS_CREATED", {
      templateId: template.id,
      blocksCreated: newBlocks.length,
      blockSummary: newBlocks.map((b) => ({
        id: b.id,
        type: b.type,
        slotCount: b.slots.length,
        populatedSlots: b.slots.filter((s) => s.widget !== null).length,
        emptySlots: b.slots.filter((s) => s.widget === null && (s.childBlocks?.length ?? 0) === 0).length,
      })),
    });

    setBlocks((prev) => {
      const result = [...normalizeBlocks(prev), ...newBlocks];
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
      const data = await generateAiWidgetRequest(prompt);
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

      setBlocks((prev) => {
        const result = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
          const newSlots = [...block.slots];
          const existingSlot = newSlots[slotIdx] ?? createEmptySlot();
          newSlots[slotIdx] = { ...existingSlot, widget: placed };
          return { ...block, slots: newSlots };
        });
        return result.blocks;
      });

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

  const saveGridRatio = async (
    blockId: string,
    settings: { ratio: string; display: "grid" | "flex"; justifyContent: string; alignItems: string; gap: string }
  ) => {
    console.log(`Debug flow: saveGridRatio fired with`, { blockId, settings });
    const result = updateBlockInTree(normalizeBlocks(blocks), blockId, (block) => ({
      ...block,
      gridRatio: settings.ratio,
      layoutDisplay: settings.display,
      justifyContent: settings.justifyContent,
      alignItems: settings.alignItems,
      gap: settings.gap,
    }));
    const updated = result.blocks;
    setBlocks(updated);
    closeGridRatioModal();
    const saveResult = await saveGridRatioApi(blockId, settings.ratio, layoutId ?? undefined, updated);
    if (saveResult.ok && saveResult.layoutId && !layoutId) {
      setLayoutId(saveResult.layoutId);
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
      await queryClient.invalidateQueries({ queryKey: navItemsQueryKey });
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
      await queryClient.invalidateQueries({ queryKey: navItemsQueryKey });
      return true;
    } catch (err) {
      console.error(`Debug flow: removeNavItem error`, err);
      return false;
    }
  };

  const openCssEditor = (blockId: string, slotIdx?: number) => {
    console.log(`Debug flow: openCssEditor fired with`, { blockId, slotIdx });
    const block = findBlockInTree(normalizeBlocks(blocks), blockId);
    const isBlockLevel = slotIdx === undefined || slotIdx === -1;

    const currentCss = isBlockLevel
      ? block?.blockStyles ?? ""  // Block-level CSS
      : block?.columnStyles?.[slotIdx] ?? "";  // Slot/column CSS

    const widget = !isBlockLevel ? block?.slots[slotIdx ?? 0]?.widget ?? null : null;

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

    const normalizedBlocks = normalizeBlocks(blocks);
    const updatedResult = updateBlockInTree(normalizedBlocks, blockId, (block) => {
      if (isBlockLevel) {
        console.log(`[Styles] Saving block-level CSS`, { blockId, css });
        return { ...block, blockStyles: css };
      }
      const styles = block.columnStyles ? [...block.columnStyles] : Array.from({ length: block.slots.length }, () => "");
      while (styles.length <= slotIdx) styles.push("");
      styles[slotIdx] = css;
      console.log(`[Styles] Saving column CSS`, { blockId, slotIdx, css });
      return { ...block, columnStyles: styles };
    });

    setBlocks(updatedResult.blocks);

    const result = await saveBlockStyles(blockId, isBlockLevel ? -1 : slotIdx, css, layoutId ?? undefined, updatedResult.blocks);
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
    setBlocks((prev) => {
      const result = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
        const newSlots = [...block.slots];
        const existing = newSlots[slotIdx];
        if (existing?.widget) {
          newSlots[slotIdx] = {
            ...existing,
            widget: { ...existing.widget, widgetData: parsed, functionCode: fnCode || undefined },
          };
        }
        return { ...block, slots: newSlots };
      });
      return result.blocks;
    });
    await saveWidgetDataApi(blockId, slotIdx, parsed, fnCode || undefined, layoutId ?? undefined);
    console.log(`Debug flow: saveWidgetDataFromEditor complete`, { blockId, slotIdx });
    return null;
  };

  const openGroqChat = (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: openGroqChat fired with`, { blockId, slotIdx });
    const block = findBlockInTree(normalizeBlocks(blocks), blockId);
    if (!block) return;
    const isBlockLevel = slotIdx < 0;
    const widget = !isBlockLevel ? block.slots[slotIdx]?.widget ?? null : null;
    const initialCss = isBlockLevel
      ? block.blockStyles ?? ""
      : block.columnStyles?.[slotIdx] ?? "";
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

    // Parse slash command prefix
    let forcedMode: "styles" | "data" | "config" | null = null;
    let cleanMessage = message;

    if (message.startsWith("/styles ")) {
      forcedMode = "styles";
      cleanMessage = message.slice("/styles ".length).trim();
    } else if (message.startsWith("/data ")) {
      forcedMode = "data";
      cleanMessage = message.slice("/data ".length).trim();
    } else if (message.startsWith("/config ")) {
      forcedMode = "config";
      cleanMessage = message.slice("/config ".length).trim();
    }

    const messageLower = cleanMessage.toLowerCase().trim();
    if (messageLower === "revert" || messageLower === "undo") {
      console.log(`Debug flow: Revert command detected`, { historyLength: cssStateHistory.length });
      if (cssStateHistory.length > 1) {
        const newHistory = [...cssStateHistory];
        newHistory.pop();
        const previousCss = newHistory[newHistory.length - 1];
        setCssStateHistory(newHistory);
        
        const { blockId, slotIdx } = groqChatContext;
        const isBlockLevel = slotIdx < 0;
        const revertedBlocks = updateBlockInTree(normalizeBlocks(blocks), blockId, (block) => {
          if (isBlockLevel) {
            return { ...block, blockStyles: previousCss };
          }
          const styles = block.columnStyles ? [...block.columnStyles] : Array.from({ length: block.slots.length }, () => "");
          while (styles.length <= slotIdx) styles.push("");
          styles[slotIdx] = previousCss;
          return { ...block, columnStyles: styles };
        }).blocks;
        setBlocks(revertedBlocks);
        setGroqChatContext((prev) => prev ? { ...prev, currentCss: previousCss } : prev);
        await saveBlockStyles(blockId, slotIdx, previousCss, layoutId ?? undefined, revertedBlocks);
        
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

    // Determine intent: forced mode overrides keyword detection
    const isStyleRequest =
      forcedMode === "styles" ||
      (!forcedMode && (
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
        messageLower.includes("style")
      ));

    const isWidgetDataUpdate =
      (forcedMode === "data" || forcedMode === "config") ||
      (!isStyleRequest && groqChatContext.widget && !forcedMode && (
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
      ));

    console.log(`Debug flow: sendGroqMessage intent detection`, { forcedMode, isStyleRequest, isWidgetDataUpdate, hasWidget: !!groqChatContext.widget });

    try {
      if (isWidgetDataUpdate && groqChatContext.widget) {
        const result = await generateAiWidgetUpdate(
          groqChatContext.blockId,
          groqChatContext.slotIdx,
          groqChatContext.widget.widgetData,
          groqChatContext.widget.widgetId,
          groqChatContext.widget.category,
          cleanMessage,
          groqMessages,
          (forcedMode === "data" || forcedMode === "config") ? forcedMode : undefined
        );

        if (result.ok && result.widgetData) {
          const { blockId, slotIdx } = groqChatContext;
          setBlocks((prev) => {
            const updateResult = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
              const newSlots = [...block.slots];
              const existing = newSlots[slotIdx];
              if (existing?.widget) {
                newSlots[slotIdx] = {
                  ...existing,
                  widget: { ...existing.widget, widgetData: result.widgetData! },
                };
              }
              return { ...block, slots: newSlots };
            });
            return updateResult.blocks;
          });
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
          cleanMessage,
          groqMessages,
          groqChatContext.widget,
          forcedMode === "styles" ? "styles" : undefined
        );
        const assistantContent = result.css ?? "Sorry, could not generate styles.";
        setGroqMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
        if (result.ok && result.css) {
          const { blockId, slotIdx } = groqChatContext;
          const isBlockLevel = slotIdx < 0;
          const merged = mergeCss(groqChatContext.currentCss, result.css);
          setCssStateHistory((prev) => [...prev, merged]);
          const styledBlocks = updateBlockInTree(normalizeBlocks(blocks), blockId, (block) => {
            if (isBlockLevel) {
              return { ...block, blockStyles: merged };
            }
            const styles = block.columnStyles ? [...block.columnStyles] : Array.from({ length: block.slots.length }, () => "");
            while (styles.length <= slotIdx) styles.push("");
            styles[slotIdx] = merged;
            return { ...block, columnStyles: styles };
          }).blocks;
          setBlocks(styledBlocks);
          setGroqChatContext((prev) => prev ? { ...prev, currentCss: merged } : prev);
          const saveResult = await saveBlockStyles(blockId, slotIdx, merged, layoutId ?? undefined, styledBlocks);
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
    ? widgetTemplates.filter((w) => {
        const result = w.category === showWidgetVariantPicker.category
          && !(showWidgetVariantPicker.category === "button" && LEGACY_GROUPED_BUTTON_WIDGETS.has(w.slug));
        console.log(`Debug flow: variantTemplates filter fired with`, {
          category: showWidgetVariantPicker.category,
          slug: w.slug,
          include: result,
        });
        return result;
      })
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
    openSlotLayoutPicker,
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
