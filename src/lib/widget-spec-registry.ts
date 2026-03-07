import type { WidgetCategory } from "@/domain/widgets/types";

const CONFIG_PATH_HINTS = [
  "feature",
  "features",
  "config",
  "settings",
  "option",
  "options",
  "variant",
  "variants",
  "pagination",
  "sorting",
  "filter",
  "column",
  "columns",
  "rows",
  "pageSize",
  "disabled",
  "enabled",
] as const;

const COMMON_LUCIDE_ICONS = [
  "Save",
  "ArrowUpRight",
  "ChevronDown",
  "Plus",
  "Upload",
  "Download",
  "FileText",
  "Search",
  "Settings",
  "Trash2",
  "Check",
  "X",
  "Bell",
  "Calendar",
  "Clock",
  "User",
  "Users",
  "LayoutDashboard",
  "BarChart3",
  "TrendingUp",
  "TrendingDown",
  "Star",
] as const;

type WidgetSpecTemplate = {
  summary: string;
  visualDescription: string;
  internalStyleRule: string;
  dataFieldHints?: string[];
  configFieldHints?: string[];
  iconFieldHints?: string[];
  styleExamples?: string[];
  dataExamples?: string[];
  configExamples?: string[];
};

export type ResolvedWidgetSpec = {
  widgetId: string;
  category: string;
  summary: string;
  visualDescription: string;
  internalStyleRule: string;
  dataFieldPaths: string[];
  configFieldPaths: string[];
  iconFieldPaths: string[];
  allowedLucideIcons: string[];
  styleExamples: string[];
  dataExamples: string[];
  configExamples: string[];
};

type FieldValidationMode = "data" | "config";

function getValueAtPath(value: unknown, path: string): unknown {
  if (!path) return value;
  const segments = path.replace(/\[\]/g, "").split(".").filter(Boolean);
  let current: unknown = value;
  for (const segment of segments) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function collectChangedPaths(previousValue: unknown, nextValue: unknown, basePath = ""): string[] {
  if (previousValue === nextValue) {
    return [];
  }

  const previousIsObject = previousValue !== null && typeof previousValue === "object";
  const nextIsObject = nextValue !== null && typeof nextValue === "object";

  if (!previousIsObject || !nextIsObject) {
    return basePath ? [basePath] : [];
  }

  if (Array.isArray(previousValue) || Array.isArray(nextValue)) {
    if (JSON.stringify(previousValue) === JSON.stringify(nextValue)) {
      return [];
    }
    return basePath ? [basePath] : [];
  }

  const keys = new Set([
    ...Object.keys(previousValue as Record<string, unknown>),
    ...Object.keys(nextValue as Record<string, unknown>),
  ]);

  const changedPaths: string[] = [];
  keys.forEach((key) => {
    const nextPath = basePath ? `${basePath}.${key}` : key;
    changedPaths.push(
      ...collectChangedPaths(
        (previousValue as Record<string, unknown>)[key],
        (nextValue as Record<string, unknown>)[key],
        nextPath
      )
    );
  });
  return unique(changedPaths);
}

const CATEGORY_SPECS: Record<WidgetCategory, WidgetSpecTemplate> = {
  stats: {
    summary: "KPI/stat card with value, label, trend text, and optional icon.",
    visualDescription: "Usually renders a large value, small label, trend indicator, and optional icon in a compact card.",
    internalStyleRule: "Use /data for KPI values, labels, trend text, and icon. Use /styles only for the container card.",
    dataFieldHints: ["value", "label", "trend", "trendUp", "period", "icon", "metrics[]"],
    iconFieldHints: ["icon"],
    dataExamples: ["/data set value to \"$52,000\" and trend to \"+8.1%\"", "/data set icon to TrendingUp"],
  },
  charts: {
    summary: "Chart widget with data arrays and color fields in widgetData.",
    visualDescription: "Renders bars, points, segments, or groups using widgetData arrays. Chart colors usually come from data fields, not wrapper CSS.",
    internalStyleRule: "Use /data for chart values, labels, and colors. Use /styles only for wrapper background, padding, spacing, and typography around the chart.",
    dataFieldHints: ["title", "bars[]", "points[]", "labels[]", "segments[].color", "channels[].color", "regions[].color", "palette[]", "groups[]", "legend[]"],
    dataExamples: ["/data update title to \"Q1 Revenue\" and bars to [40,55,70,90]", "/data change segments[].color values to blue tones"],
    styleExamples: ["/styles background-color: #ffffff; padding: 20px; border-radius: 16px;"],
  },
  progress: {
    summary: "Progress widget with percentage labels, goals, or completion metrics.",
    visualDescription: "Renders shadcn progress bars and completion text such as pct, goals[].pct, or done/total summaries.",
    internalStyleRule: "Use /data for pct/current/target/goals/done values. Use /styles for wrapper CSS and progress theming supported by the slot styles.",
    dataFieldHints: ["label", "title", "pct", "current", "target", "currentLabel", "targetLabel", "goals[]", "done", "total", "daysLeft"],
    dataExamples: ["/data set pct to 82 and currentLabel to \"$82,000\"", "/data update goals[0].pct to 90"],
    styleExamples: ["/styles color: #ef4444; background-color: #ffffff; padding: 20px;"],
  },
  activity: {
    summary: "Activity feed widget with items and status/timestamp content.",
    visualDescription: "Renders feed rows with text, timestamps, and status/color indicators from widgetData.",
    internalStyleRule: "Use /data for feed items, labels, timestamps, and colors. Use /styles only for wrapper layout.",
    dataFieldHints: ["items[]", "items[].color", "items[].text", "items[].time", "items[].level", "items[].message"],
    dataExamples: ["/data add a new activity item for \"Customer upgraded\" at \"2 min ago\""],
  },
  comparison: {
    summary: "Comparison widget showing current vs target or previous values.",
    visualDescription: "Renders side-by-side comparison values with progress or trend indicators.",
    internalStyleRule: "Use /data for current/target/remaining/metrics values. Use /styles for container appearance only.",
    dataFieldHints: ["title", "metrics[]", "actual", "target", "pct", "actualLabel", "targetLabel", "remaining"],
    dataExamples: ["/data set actual to 92000 and remaining to \"$8,000 to go\""],
  },
  health: {
    summary: "System health widget with services, status, uptime, or latency values.",
    visualDescription: "Renders services with status dots, uptime percentages, or p50/p99 metrics.",
    internalStyleRule: "Use /data for services and status values. Use /styles only for the outer card.",
    dataFieldHints: ["title", "services[]", "services[].status", "services[].uptime", "services[].p50", "services[].p99"],
    dataExamples: ["/data update services[0].uptime to 99.99"],
  },
  timeline: {
    summary: "Timeline widget with dated events and colored markers.",
    visualDescription: "Renders ordered event items with title, time, and color markers.",
    internalStyleRule: "Use /data for event content and colors. Use /styles for container spacing/background only.",
    dataFieldHints: ["events[]", "events[].title", "events[].time", "events[].color"],
    dataExamples: ["/data add an event titled \"Board Review\" with time \"Friday\""],
  },
  list: {
    summary: "List widget with ranked items, members, scores, or percentages.",
    visualDescription: "Renders repeatable list items with text and lightweight indicators like bars or scores.",
    internalStyleRule: "Use /data for list rows, names, scores, and percentages. Use /styles for wrapper styling only.",
    dataFieldHints: ["items[]", "members[]", "entries[]"],
    dataExamples: ["/data update members[1].score to 91"],
  },
  table: {
    summary: "Table widget with rows plus feature/settings config such as sorting, filtering, pagination, and page size.",
    visualDescription: "Renders a table with columns, rows, and optional table feature controls.",
    internalStyleRule: "Use /data for row values and labels. Use /config for features, columns, and pagination settings. Use /styles only for outer container CSS.",
    dataFieldHints: ["title", "rows[]", "columns[]"],
    configFieldHints: ["features.sorting", "features.filtering", "features.pagination", "features.columnVisibility", "features.columnResizing", "features.rowSelection", "features.expandableRows", "pageSize"],
    dataExamples: ["/data add a new row with status \"Pending\""],
    configExamples: ["/config enable sorting and pagination", "/config set pageSize to 20"],
  },
  funnel: {
    summary: "Funnel widget with ordered stages and conversion percentages.",
    visualDescription: "Renders funnel stages with widths or gradients derived from pct/value fields.",
    internalStyleRule: "Use /data for stages, values, and percentages. Use /styles for wrapper appearance only.",
    dataFieldHints: ["title", "stages[]", "stages[].label", "stages[].value", "stages[].pct"],
    dataExamples: ["/data add a new funnel stage for \"Activated\" with pct 12"],
  },
  leaderboard: {
    summary: "Leaderboard widget with ranked entries, scores, and badges.",
    visualDescription: "Renders ranked rows with name, score, rank, and badge/trophy indicators.",
    internalStyleRule: "Use /data for entries, scores, and badge values. Use /styles for card styling only.",
    dataFieldHints: ["title", "entries[]", "entries[].rank", "entries[].name", "entries[].score", "entries[].badge"],
    dataExamples: ["/data set entries[0].score to 3020"],
  },
  summary: {
    summary: "Summary widget with KPI groups or scorecard items.",
    visualDescription: "Renders grouped summary KPIs, often in a small grid or stacked list.",
    internalStyleRule: "Use /data for KPI values/trends/status. Use /styles for wrapper surface and layout only.",
    dataFieldHints: ["title", "kpis[]", "items[]"],
    dataExamples: ["/data update kpis[0].value to \"$910K\""],
  },
  button: {
    summary: "Button widget with label, variant, optional icon, and optional color fields stored in widgetData.",
    visualDescription: "Renders one or more action buttons. Visual style variants and icon choices often come from widgetData.",
    internalStyleRule: "Use /data for label, variant, icon, button colors, and button-specific fields. Use /styles only for moving or styling the outer container.",
    dataFieldHints: ["label", "description", "variant", "icon", "buttonBgColor", "buttonTextColor", "iconColor", "arrowBgColor", "labels", "options"],
    iconFieldHints: ["icon"],
    dataExamples: ["/data set label to \"Export report\" and variant to \"outline\"", "/data set icon to Upload"],
  },
  dropdown: {
    summary: "Dropdown/select widget with options, labels, selected values, and optional search behavior.",
    visualDescription: "Renders selection controls with trigger text and option lists.",
    internalStyleRule: "Use /data for options, labels, placeholder, and selected state. Use /config for feature/option structure only if such fields exist. Use /styles for wrapper layout only.",
    dataFieldHints: ["label", "placeholder", "options[]", "selected", "filters[]"],
    configFieldHints: ["options[]"],
    dataExamples: ["/data change placeholder to \"Select assignee\""],
  },
  menu: {
    summary: "Menu/navigation widget with items, icons, badges, and active states.",
    visualDescription: "Renders navigation or command items with icons and labels.",
    internalStyleRule: "Use /data for menu items, labels, icons, and badges. Use /styles only for container styling.",
    dataFieldHints: ["title", "items[]", "items[].icon", "items[].label", "items[].active", "items[].badge"],
    iconFieldHints: ["items[].icon"],
    dataExamples: ["/data set items[0].icon to LayoutDashboard"],
  },
  search: {
    summary: "Search widget with placeholder text, filters, categories, and recent items.",
    visualDescription: "Renders one or more search inputs, chips, categories, and recent results sections.",
    internalStyleRule: "Use /data for placeholder text, filters, categories, and recent items. Use /styles for wrapper layout and surface only.",
    dataFieldHints: ["placeholder", "filters[]", "categories[]", "recent[]", "placeholders"],
    dataExamples: ["/data change placeholder to \"Search customers...\""],
  },
  form: {
    summary: "Form widget with fields, labels, placeholders, helper text, and submit CTA content.",
    visualDescription: "Renders labeled inputs/selects or grouped form controls.",
    internalStyleRule: "Use /data for fields, labels, placeholders, and helper text. Use /styles for container styling only.",
    dataFieldHints: ["label", "placeholder", "helperText", "required", "fields[]", "tags[]"],
    dataExamples: ["/data change helperText to \"Required for invoicing\""],
  },
};

const WIDGET_OVERRIDES: Record<string, Partial<WidgetSpecTemplate>> = {
  "sales-target": {
    dataFieldHints: ["label", "current", "target", "pct", "currentLabel", "targetLabel"],
    styleExamples: ["/styles color: #ef4444; background-color: #ffffff; padding: 20px;"],
    dataExamples: ["/data set pct to 80 and currentLabel to \"$80,000\""],
  },
  "goal-tracker": {
    dataFieldHints: ["title", "goals[]", "goals[].name", "goals[].pct"],
    dataExamples: ["/data update goals[1].pct to 74"],
  },
  "sprint-progress": {
    dataFieldHints: ["sprint", "done", "total", "pct", "daysLeft"],
    dataExamples: ["/data set done to 20 and pct to 83"],
  },
  "orders-table": {
    configFieldHints: ["features.sorting", "features.filtering", "features.pagination", "pageSize", "columns[]"],
  },
  "customers-table": {
    configFieldHints: ["features.sorting", "features.filtering", "features.pagination", "pageSize", "columns[]"],
  },
  "button-left-icon": {
    iconFieldHints: ["icon"],
    dataFieldHints: ["label", "description", "icon", "buttonBgColor", "buttonTextColor", "iconColor"],
  },
  "button-right-icon": {
    iconFieldHints: ["icon"],
    dataFieldHints: ["label", "description", "icon", "buttonBgColor", "buttonTextColor", "iconColor"],
  },
};

function unique(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => !!value && value.trim().length > 0)));
}

export function collectWidgetDataPaths(value: unknown, basePath = "", depth = 0, maxDepth = 3): string[] {
  if (depth > maxDepth || value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    const arrayPath = basePath ? `${basePath}[]` : "[]";
    const nested = value.length > 0 ? collectWidgetDataPaths(value[0], arrayPath, depth + 1, maxDepth) : [];
    return unique([arrayPath, ...nested]);
  }
  if (typeof value !== "object") {
    return basePath ? [basePath] : [];
  }
  const paths: string[] = [];
  Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
    const nextPath = basePath ? `${basePath}.${key}` : key;
    paths.push(nextPath);
    paths.push(...collectWidgetDataPaths(child, nextPath, depth + 1, maxDepth));
  });
  return unique(paths);
}

function inferConfigPaths(dataPaths: string[]): string[] {
  return unique(
    dataPaths.filter((path) =>
      CONFIG_PATH_HINTS.some((hint) => path.toLowerCase().includes(hint.toLowerCase()))
    )
  );
}

function inferIconPaths(dataPaths: string[]): string[] {
  return unique(dataPaths.filter((path) => /icon/i.test(path)));
}

function buildDefaultDataExample(dataPaths: string[], category: string): string[] {
  const firstPath = dataPaths.find((path) => !path.endsWith("[]"));
  if (!firstPath) {
    return category === "table"
      ? ["/config enable sorting and pagination"]
      : ["/styles background-color: #ffffff; padding: 20px;"];
  }
  return [`/data update ${firstPath} to a new value`];
}

function buildDefaultConfigExample(configPaths: string[]): string[] {
  if (configPaths.some((path) => path.includes("features.pagination"))) {
    return ["/config enable pagination and sorting"];
  }
  if (configPaths.length > 0) {
    return [`/config update ${configPaths[0]} to a new value`];
  }
  return ["/config update available settings/options fields"];
}

export function getWidgetSpec(
  widgetId: string,
  category: string,
  widgetData: Record<string, unknown>
): ResolvedWidgetSpec {
  const typedCategory = category as WidgetCategory;
  const categorySpec = CATEGORY_SPECS[typedCategory];
  const widgetOverride = WIDGET_OVERRIDES[widgetId] ?? {};
  const inferredPaths = collectWidgetDataPaths(widgetData);
  const dataFieldPaths = unique([...(categorySpec?.dataFieldHints ?? []), ...(widgetOverride.dataFieldHints ?? []), ...inferredPaths]);
  const configFieldPaths = unique([
    ...(categorySpec?.configFieldHints ?? []),
    ...(widgetOverride.configFieldHints ?? []),
    ...inferConfigPaths(inferredPaths),
  ]);
  const iconFieldPaths = unique([
    ...(categorySpec?.iconFieldHints ?? []),
    ...(widgetOverride.iconFieldHints ?? []),
    ...inferIconPaths(inferredPaths),
  ]);
  const styleExamples = unique([
    ...(widgetOverride.styleExamples ?? []),
    ...(categorySpec?.styleExamples ?? []),
    "/styles background-color: #ffffff; padding: 20px;",
  ]);
  const dataExamples = unique([
    ...(widgetOverride.dataExamples ?? []),
    ...(categorySpec?.dataExamples ?? []),
    ...buildDefaultDataExample(dataFieldPaths, category),
  ]);
  const configExamples = unique([
    ...(widgetOverride.configExamples ?? []),
    ...(categorySpec?.configExamples ?? []),
    ...buildDefaultConfigExample(configFieldPaths),
  ]);

  return {
    widgetId,
    category,
    summary: widgetOverride.summary ?? categorySpec?.summary ?? "Widget with configurable data and optional config/settings fields.",
    visualDescription: widgetOverride.visualDescription ?? categorySpec?.visualDescription ?? "Renders the selected widget using the current widgetData structure.",
    internalStyleRule: widgetOverride.internalStyleRule ?? categorySpec?.internalStyleRule ?? "Use /data for widget internals and /styles only for wrapper/container CSS.",
    dataFieldPaths,
    configFieldPaths,
    iconFieldPaths,
    allowedLucideIcons: [...COMMON_LUCIDE_ICONS],
    styleExamples,
    dataExamples,
    configExamples,
  };
}

export function buildWidgetSpecPrompt(spec: ResolvedWidgetSpec): string {
  return [
    "WIDGET_SPEC_CONTRACT_START",
    `Widget ID: ${spec.widgetId}`,
    `Widget Category: ${spec.category}`,
    `Summary: ${spec.summary}`,
    `Visual Description: ${spec.visualDescription}`,
    `Internal Style Rule: ${spec.internalStyleRule}`,
    `Allowed Data Fields: ${spec.dataFieldPaths.length > 0 ? spec.dataFieldPaths.join(", ") : "(none)"}`,
    `Allowed Config Fields: ${spec.configFieldPaths.length > 0 ? spec.configFieldPaths.join(", ") : "(none)"}`,
    `Allowed Icon Fields: ${spec.iconFieldPaths.length > 0 ? spec.iconFieldPaths.join(", ") : "(none)"}`,
    `Allowed Lucide Icons: ${spec.allowedLucideIcons.join(", ")}`,
    "Mandatory Rules:",
    "- Base your answer on this selected widget contract.",
    "- Never invent fields, config keys, icon keys, or commands outside this contract and current widgetData.",
    "- Use /styles only for wrapper/container CSS declarations.",
    "- Use /data only for fields listed in Allowed Data Fields or existing widgetData paths.",
    "- Use /config only for fields listed in Allowed Config Fields.",
    "- If the request falls outside this contract, say so instead of guessing.",
    `Style Examples: ${spec.styleExamples.join(" | ")}`,
    `Data Examples: ${spec.dataExamples.join(" | ")}`,
    `Config Examples: ${spec.configExamples.join(" | ")}`,
    "WIDGET_SPEC_CONTRACT_END",
  ].join("\n");
}

export function validateWidgetDataAgainstSpec(
  previousWidgetData: Record<string, unknown>,
  widgetData: Record<string, unknown>,
  spec: ResolvedWidgetSpec,
  mode: FieldValidationMode = "data"
): { ok: boolean; invalidPaths: string[] } {
  const allowedRoots = new Set(mode === "config" ? spec.configFieldPaths : [...spec.dataFieldPaths, ...spec.iconFieldPaths]);
  const changedPaths = collectChangedPaths(previousWidgetData, widgetData);
  const invalidPaths = changedPaths.filter((path) => {
    const normalizedPath = path.replace(/\[\]/g, "");
    for (const allowedPath of allowedRoots) {
      const normalizedAllowedPath = allowedPath.replace(/\[\]/g, "");
      if (normalizedPath === normalizedAllowedPath) {
        return false;
      }
      if (normalizedAllowedPath.length > 0 && normalizedPath.startsWith(`${normalizedAllowedPath}.`)) {
        return false;
      }
      const currentValueForAllowedPath = getValueAtPath(previousWidgetData, allowedPath);
      if (currentValueForAllowedPath !== undefined && normalizedPath === normalizedAllowedPath) {
        return false;
      }
    }
    return true;
  });
  return { ok: invalidPaths.length === 0, invalidPaths };
}
