import type {
  LayoutType,
  LayoutBlock,
  LayoutSlot,
  PlacedWidget,
} from "@/domain/builder/types";

export const LEGACY_GROUPED_BUTTON_WIDGETS = new Set(["upload-buttons", "button-variant-set"]);

function generateId(): string {
  console.log(`Debug flow: generateId fired with`, {});
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

export function createEmptySlot(): LayoutSlot {
  console.log(`Debug flow: createEmptySlot fired with`, {});
  return { widget: null, childBlocks: [] };
}

function createEmptySlots(type: LayoutType): LayoutSlot[] {
  console.log(`Debug flow: createEmptySlots fired with`, { type });
  return Array.from({ length: slotCount(type) }, () => createEmptySlot());
}

export function createBlock(type: LayoutType): LayoutBlock {
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

export function normalizeBlocks(blocks: LayoutBlock[]): LayoutBlock[] {
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

export function findBlockInTree(blocks: LayoutBlock[], blockId: string): LayoutBlock | null {
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

export function updateBlockInTree(
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

export function removeBlockFromTree(blocks: LayoutBlock[], blockId: string): LayoutBlock[] {
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

const w = (
  widgetId: string,
  category: PlacedWidget["category"],
  title: string,
  widgetData: Record<string, unknown> = {}
): PlacedWidget => ({
  widgetId,
  category,
  title,
  widgetData,
});

export const TEMPLATE_BLOCK_MAP: Record<string, BlockDef[]> = {
  "metrics-overview": [
    {
      type: "grid-4",
      slots: [
        w("revenue-kpi", "stats", "Total Revenue", { value: "$45,231", label: "Total Revenue", trend: "+12.5%", trendUp: true, period: "This month" }),
        w("user-growth", "stats", "Active Users", { value: "12,543", label: "Active Users", trend: "+8.2%", trendUp: true, period: "This week" }),
        w("conversion-rate", "stats", "Conversion Rate", { value: "3.24%", label: "Conversion Rate", trend: "-1.2%", trendUp: false, period: "vs last week" }),
        w("sparkline", "stats", "Page Views", { value: "2,543", label: "Page Views", bars: [30, 45, 35, 60, 50, 70, 65, 80, 75, 85, 90, 95], period: "Today" }),
      ],
    },
    {
      type: "single",
      slots: [
        w("revenue-chart", "charts", "Monthly Revenue", { title: "Monthly Revenue", bars: [50, 65, 80, 100, 75, 90, 88, 95], labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"] }),
      ],
    },
  ],

  "split-dashboard": [
    {
      type: "grid-2",
      slots: [
        w("revenue-kpi", "stats", "Total Revenue", { value: "$45,231", label: "Total Revenue", trend: "+12.5%", trendUp: true, period: "This month" }),
        w("user-growth", "stats", "Active Users", { value: "12,543", label: "Active Users", trend: "+8.2%", trendUp: true, period: "This week" }),
      ],
    },
    {
      type: "single",
      slots: [
        w("revenue-chart", "charts", "Revenue Overview", { title: "Revenue Overview", bars: [50, 65, 80, 100, 75, 90], labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] }),
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
        w("revenue-kpi", "stats", "Total Revenue", { value: "$45,231", label: "Total Revenue", trend: "+12.5%", trendUp: true, period: "This month" }),
        w("user-growth", "stats", "Active Users", { value: "12,543", label: "Active Users", trend: "+8.2%", trendUp: true, period: "This week" }),
        w("conversion-rate", "stats", "Conversion Rate", { value: "3.24%", label: "Conversion Rate", trend: "-1.2%", trendUp: false, period: "vs last week" }),
      ],
    },
    {
      type: "grid-3",
      slots: [
        w("sparkline", "stats", "Page Views", { value: "2,543", label: "Page Views", bars: [30, 45, 35, 60, 50, 70, 65, 80], period: "Today" }),
        w("mrr", "stats", "MRR", { value: "$89,200", label: "Monthly Recurring Revenue", trend: "+15.8%", trendUp: true, period: "This month" }),
        w("satisfaction", "stats", "Satisfaction", { value: "4.8", label: "Customer Satisfaction", filledStars: 4, reviews: 1234 }),
      ],
    },
  ],

  "analytics-dashboard": [
    {
      type: "single",
      slots: [
        w("line-trend", "charts", "Revenue Trend", { title: "Revenue Trend", points: [20, 35, 28, 45, 38, 55, 48, 62, 55, 70, 65, 78], labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] }),
      ],
    },
    {
      type: "grid-4",
      slots: [
        w("revenue-kpi", "stats", "Total Revenue", { value: "$45,231", label: "Total Revenue", trend: "+12.5%", trendUp: true, period: "This month" }),
        w("user-growth", "stats", "Active Users", { value: "12,543", label: "Active Users", trend: "+8.2%", trendUp: true, period: "This week" }),
        w("conversion-rate", "stats", "Conversion Rate", { value: "3.24%", label: "Conversion Rate", trend: "-1.2%", trendUp: false, period: "vs last week" }),
        w("realtime-users", "stats", "Live Users", { value: "1,234", label: "Active Users Now", period: "Online right now", live: true }),
      ],
    },
  ],

  "monitoring-dashboard": [
    {
      type: "single",
      slots: [
        w("revenue-chart", "charts", "Monthly Revenue", { title: "Monthly Revenue", bars: [50, 65, 80, 100, 75, 90, 88, 95], labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"] }),
      ],
    },
    {
      type: "single",
      slots: [
        w("activity-chart", "charts", "User Activity", { title: "User Activity", bars: [40, 60, 45, 80, 55, 70, 65, 85, 75, 90, 80, 95] }),
      ],
    },
    {
      type: "single",
      slots: [
        w("traffic-pie", "charts", "Traffic Sources", { title: "Traffic Sources", segments: [{ label: "Direct", value: "45%", pct: 45, color: "#6366f1" }, { label: "Organic", value: "30%", pct: 30, color: "#a855f7" }, { label: "Social", value: "25%", pct: 25, color: "#ec4899" }] }),
      ],
    },
  ],

  "kpi-dashboard": [
    {
      type: "grid-2",
      slots: [
        w("revenue-kpi", "stats", "Total Revenue", { value: "$45,231", label: "Total Revenue", trend: "+12.5%", trendUp: true, period: "This month" }),
        w("revenue-chart", "charts", "Revenue Chart", { title: "Revenue Chart", bars: [50, 65, 80, 100, 75, 90], labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] }),
      ],
    },
    {
      type: "grid-2",
      slots: [
        w("user-growth", "stats", "Active Users", { value: "12,543", label: "Active Users", trend: "+8.2%", trendUp: true, period: "This week" }),
        w("activity-chart", "charts", "Activity Chart", { title: "Activity Chart", bars: [40, 60, 45, 80, 55, 70, 65, 85] }),
      ],
    },
  ],
};
