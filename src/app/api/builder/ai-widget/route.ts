import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import * as fs from "fs";
import * as path from "path";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function loadChartKnowledge(): string {
  try {
    const filePath = path.join(process.cwd(), "src", "lib", "aiKnowledgeBase", "how-to-create-chart.md");
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

function loadTableKnowledge(): string {
  try {
    const filePath = path.join(process.cwd(), "src", "lib", "aiKnowledgeBase", "tanstack-table-features.md");
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

const SUPPORTED_WIDGET_CATEGORIES = [
  "stats",
  "charts",
  "progress",
  "activity",
  "comparison",
  "health",
  "timeline",
  "list",
  "table",
  "funnel",
  "leaderboard",
  "summary",
  "button",
  "dropdown",
  "menu",
  "search",
  "form",
];

const SUPPORTED_WIDGETS = [
  { widgetId: "total-revenue", category: "stats", aliases: ["revenue-kpi"], intents: ["revenue", "sales", "kpi", "metric", "total"], schema: `{ value: "$12,345", label: "Total Revenue", icon: "DollarSign", change: "+12.5%", up: true, period: "vs last month" }`, examplePrompt: "show total revenue kpi", exampleResponse: `{"widgetId":"total-revenue","category":"stats","title":"Total Revenue","widgetData":{"value":"$12,345","label":"Total Revenue","icon":"DollarSign","change":"+12.5%","up":true,"period":"vs last month"}}` },
  { widgetId: "active-users", category: "stats", aliases: ["user-growth"], intents: ["users", "active users", "growth", "kpi", "metric"], schema: `{ value: "1,234", label: "Active Users", icon: "Users", change: "+8%", up: true, period: "this week" }`, examplePrompt: "show active users metric", exampleResponse: `{"widgetId":"active-users","category":"stats","title":"Active Users","widgetData":{"value":"1,234","label":"Active Users","icon":"Users","change":"+8%","up":true,"period":"this week"}}` },
  { widgetId: "chart-bar", category: "charts", aliases: ["revenue-chart", "bar-chart"], intents: ["bar chart", "bar graph", "sales analytics", "chart", "analytics"], schema: `{ title: "Monthly Revenue", icon: "BarChart3", xKey: "month", bars: [{ dataKey: "revenue", label: "Revenue", color: "#3b82f6" }], data: [{ month: "Jan", revenue: 50 }, { month: "Feb", revenue: 65 }] }`, examplePrompt: "create me a sales analytics", exampleResponse: `{"widgetId":"chart-bar","category":"charts","title":"Sales Analytics","widgetData":{"title":"Monthly Sales","xKey":"month","bars":[{"dataKey":"sales","label":"Sales","color":"#3b82f6"}],"data":[{"month":"Jan","sales":65},{"month":"Feb","sales":78},{"month":"Mar","sales":82},{"month":"Apr","sales":95},{"month":"May","sales":88},{"month":"Jun","sales":92}]}}` },
  { widgetId: "chart-line", category: "charts", aliases: ["line-chart", "line-trend"], intents: ["line chart", "trend", "trend line", "time series", "area chart"], schema: `{ title: "Revenue Trend", icon: "TrendingUp", xKey: "month", lines: [{ dataKey: "revenue", label: "Revenue", color: "#3b82f6" }], data: [{ month: "Jan", revenue: 20 }, { month: "Feb", revenue: 35 }] }`, examplePrompt: "create analytics for sales with line chart", exampleResponse: `{"widgetId":"chart-line","category":"charts","title":"Sales Analytics","widgetData":{"title":"Monthly Sales Trend","xKey":"month","lines":[{"dataKey":"sales","label":"Sales","color":"#3b82f6"}],"data":[{"month":"Jan","sales":45},{"month":"Feb","sales":52},{"month":"Mar","sales":48},{"month":"Apr","sales":61},{"month":"May","sales":58},{"month":"Jun","sales":70},{"month":"Jul","sales":65},{"month":"Aug","sales":78},{"month":"Sep","sales":72},{"month":"Oct","sales":85},{"month":"Nov","sales":80},{"month":"Dec","sales":92}]}}` },
  { widgetId: "traffic-pie", category: "charts", aliases: ["pie-chart", "donut-chart"], intents: ["pie chart", "traffic sources", "distribution", "donut"], schema: `{ title: "Traffic Sources", icon: "PieChart", segments: [{ label: "Direct", value: "45%", pct: 45, color: "#6366f1" }, { label: "Organic", value: "30%", pct: 30, color: "#a855f7" }] }`, examplePrompt: "show traffic sources chart", exampleResponse: `{"widgetId":"traffic-pie","category":"charts","title":"Traffic Sources","widgetData":{"title":"Traffic Sources","icon":"PieChart","segments":[{"label":"Direct","value":"45%","pct":45,"color":"#6366f1"},{"label":"Organic","value":"30%","pct":30,"color":"#a855f7"},{"label":"Social","value":"25%","pct":25,"color":"#ec4899"}]}}` },
  { widgetId: "sales-target", category: "progress", aliases: [], intents: ["target", "progress", "goal progress", "sales target"], schema: `{ label: "Sales Target", pct: 75, currentLabel: "$75,000", targetLabel: "$100,000" }`, examplePrompt: "show sales target progress", exampleResponse: `{"widgetId":"sales-target","category":"progress","title":"Sales Target","widgetData":{"label":"Sales Target","pct":75,"currentLabel":"$75,000","targetLabel":"$100,000"}}` },
  { widgetId: "goal-tracker", category: "progress", aliases: [], intents: ["goal tracker", "goals", "milestones", "progress tracker"], schema: `{ title: "Quarterly Goals", goals: [{ name: "Revenue", pct: 85 }, { name: "Users", pct: 70 }] }`, examplePrompt: "create a goal tracker", exampleResponse: `{"widgetId":"goal-tracker","category":"progress","title":"Quarterly Goals","widgetData":{"title":"Quarterly Goals","goals":[{"name":"Revenue","pct":85},{"name":"Users","pct":70}]}}` },
  { widgetId: "activity-feed", category: "activity", aliases: [], intents: ["activity", "activity feed", "recent activity", "notifications"], schema: `{ items: [{ color: "bg-emerald-500", text: "New user signed up", time: "2 min ago" }] }`, examplePrompt: "show recent activity", exampleResponse: `{"widgetId":"activity-feed","category":"activity","title":"Recent Activity","widgetData":{"items":[{"color":"bg-emerald-500","text":"New user signed up","time":"2 min ago"},{"color":"bg-blue-500","text":"Quarterly report exported","time":"15 min ago"},{"color":"bg-orange-500","text":"Billing issue detected","time":"1 hr ago"}]}}` },
  { widgetId: "error-log", category: "activity", aliases: [], intents: ["errors", "error log", "logs", "system errors"], schema: `{ items: [{ level: "error", message: "TypeError in /api/widgets", time: "5 min ago" }] }`, examplePrompt: "show error logs", exampleResponse: `{"widgetId":"error-log","category":"activity","title":"Error Log","widgetData":{"items":[{"level":"error","message":"TypeError in /api/widgets","time":"5 min ago"},{"level":"warn","message":"Slow query on orders table","time":"11 min ago"}]}}` },
  { widgetId: "top-products", category: "list", aliases: [], intents: ["top products", "ranked list", "best products", "leaderboard list"], schema: `{ items: [{ name: "Widget Pro", sales: 234, pct: 95 }] }`, examplePrompt: "show top performing products", exampleResponse: `{"widgetId":"top-products","category":"list","title":"Top Products","widgetData":{"items":[{"name":"Premium Plan","sales":342,"pct":95},{"name":"Starter Plan","sales":289,"pct":80},{"name":"Enterprise Plan","sales":156,"pct":43}]}}` },
  { widgetId: "team-performance", category: "list", aliases: [], intents: ["team performance", "team ranking", "employee performance"], schema: `{ members: [{ name: "Alice", score: 95 }] }`, examplePrompt: "show team performance", exampleResponse: `{"widgetId":"team-performance","category":"list","title":"Team Performance","widgetData":{"members":[{"name":"Alice","score":95},{"name":"Marcus","score":89},{"name":"Nina","score":84}]}}` },
  { widgetId: "conversion-funnel", category: "funnel", aliases: [], intents: ["funnel", "conversion funnel", "sales pipeline", "pipeline"], schema: `{ title: "Conversion Funnel", stages: [{ label: "Visitors", value: 10000, pct: 100 }, { label: "Sign-ups", value: 2400, pct: 24 }] }`, examplePrompt: "show conversion funnel", exampleResponse: `{"widgetId":"conversion-funnel","category":"funnel","title":"Conversion Funnel","widgetData":{"title":"Conversion Funnel","stages":[{"label":"Visitors","value":10000,"pct":100},{"label":"Sign-ups","value":2400,"pct":24},{"label":"Customers","value":520,"pct":5.2}]}}` },
  { widgetId: "executive-summary", category: "summary", aliases: [], intents: ["summary", "executive summary", "overview", "kpi summary"], schema: `{ title: "Executive Summary", kpis: [{ label: "Revenue", value: "$892K", trend: "+12%", up: true }] }`, examplePrompt: "create executive summary", exampleResponse: `{"widgetId":"executive-summary","category":"summary","title":"Executive Summary","widgetData":{"title":"Executive Summary","kpis":[{"label":"Revenue","value":"$892K","trend":"+12%","up":true},{"label":"Churn","value":"2.1%","trend":"-0.4%","up":true}]}}` },
  { widgetId: "monthly-metrics", category: "summary", aliases: [], intents: ["monthly metrics", "month summary", "monthly kpis"], schema: `{ month: "This Month", metrics: [{ label: "Total Sales", value: "$124,500" }] }`, examplePrompt: "show monthly metrics", exampleResponse: `{"widgetId":"monthly-metrics","category":"summary","title":"Monthly Metrics","widgetData":{"month":"This Month","metrics":[{"label":"Total Sales","value":"$124,500"},{"label":"New Customers","value":"342"}]}}` },
  { widgetId: "orders-table", category: "table", aliases: [], intents: ["orders table", "order list", "orders", "recent orders"], schema: `{ title: "Order List", rows: [{ id: "ORD-001", customer: "John Doe", amount: "$150.00", status: "Completed" }], features: { sorting: true, filtering: true, pagination: true, columnVisibility: true, columnResizing: true, rowSelection: true }, pageSize: 20 }`, examplePrompt: "show me a table of recent orders", exampleResponse: `{"widgetId":"orders-table","category":"table","title":"Recent Orders","widgetData":{"title":"Recent Orders","rows":[{"id":"ORD-001","customer":"Alice Johnson","amount":"$129.00","status":"Completed"},{"id":"ORD-002","customer":"Bob Smith","amount":"$64.50","status":"Pending"},{"id":"ORD-003","customer":"Carol White","amount":"$512.00","status":"Failed"},{"id":"ORD-004","customer":"Dave Brown","amount":"$89.99","status":"Completed"}],"features":{"sorting":true,"filtering":true,"pagination":true,"columnVisibility":true,"columnResizing":true,"rowSelection":true,"expandableRows":false},"pageSize":20}}` },
  { widgetId: "customers-table", category: "table", aliases: [], intents: ["customers table", "customer list", "customers", "crm table"], schema: `{ title: "Customer List", rows: [{ name: "Alice", email: "alice@example.com", plan: "Pro", spend: "$1,200" }], features: { sorting: true, filtering: true, pagination: true, columnVisibility: true, columnResizing: true, rowSelection: true }, pageSize: 20 }`, examplePrompt: "create a customer management table with sorting and filtering", exampleResponse: `{"widgetId":"customers-table","category":"table","title":"Customer Management","widgetData":{"title":"Customer Management","rows":[{"name":"Alice Johnson","email":"alice@acme.com","plan":"Pro","spend":"$1,200"},{"name":"Bob Smith","email":"bob@corp.io","plan":"Enterprise","spend":"$8,400"},{"name":"Carol White","email":"carol@shop.co","plan":"Free","spend":"$0"},{"name":"Dave Brown","email":"dave@dev.ai","plan":"Pro","spend":"$1,200"}],"features":{"sorting":true,"filtering":true,"pagination":true,"columnVisibility":true,"columnResizing":true,"rowSelection":true,"expandableRows":false},"pageSize":20}}` },
  { widgetId: "transactions-table", category: "table", aliases: [], intents: ["transactions table", "transactions", "payments table", "transaction list"], schema: `{ title: "Transactions", rows: [{ date: "Mar 4", desc: "Payment", amount: "+$1,200", type: "credit" }], features: { sorting: true, filtering: true, pagination: true, columnVisibility: true, columnResizing: true, rowSelection: true }, pageSize: 20 }`, examplePrompt: "show transactions table", exampleResponse: `{"widgetId":"transactions-table","category":"table","title":"Transactions","widgetData":{"title":"Transactions","rows":[{"date":"Mar 4","desc":"Payment","amount":"+$1,200","type":"credit"},{"date":"Mar 5","desc":"Refund","amount":"-$85","type":"debit"}],"features":{"sorting":true,"filtering":true,"pagination":true,"columnVisibility":true,"columnResizing":true,"rowSelection":true},"pageSize":20}}` },
  { widgetId: "search-bar", category: "search", aliases: ["search-input", "search-box", "search-field", "input-search", "search"], intents: ["search", "search input", "search bar", "search box", "search icon"], schema: `{ placeholder: "Search products..." }`, examplePrompt: "create me a search input with search icon", exampleResponse: `{"widgetId":"search-bar","category":"search","title":"Search Input","widgetData":{"placeholder":"Search products..."}}` },
  { widgetId: "search-with-filters", category: "search", aliases: ["search-filter", "search-filters", "filter-search"], intents: ["search with filters", "filtered search", "search filters", "filter search"], schema: `{ placeholder: "Search users...", filters: [{ label: "All", active: true }, { label: "Active" }, { label: "Inactive" }] }`, examplePrompt: "add a search input with filters for users", exampleResponse: `{"widgetId":"search-with-filters","category":"search","title":"User Search","widgetData":{"placeholder":"Search users...","filters":[{"label":"All","active":true},{"label":"Active"},{"label":"Inactive"},{"label":"Admin"}]}}` },
  { widgetId: "global-search", category: "search", aliases: ["global-search-input", "command-search"], intents: ["global search", "command menu", "command palette", "search modal", "search recent"], schema: `{ placeholder: "Search dashboards...", categories: [{ label: "Pages", count: 12 }, { label: "Users", count: 48 }], recent: ["Revenue report", "User analytics", "Q4 dashboard"] }`, examplePrompt: "create a command palette search", exampleResponse: `{"widgetId":"global-search","category":"search","title":"Global Search","widgetData":{"placeholder":"Search dashboards...","categories":[{"label":"Pages","count":12},{"label":"Users","count":48}],"recent":["Revenue report","User analytics","Q4 dashboard"]}}` },
  { widgetId: "text-input", category: "form", aliases: [], intents: ["text input", "input field", "name field", "email field"], schema: `{ label: "Full Name", placeholder: "Enter your full name", helperText: "Used for display purposes", required: true }`, examplePrompt: "create a text input", exampleResponse: `{"widgetId":"text-input","category":"form","title":"Text Input","widgetData":{"label":"Full Name","placeholder":"Enter your full name","helperText":"Used for display purposes","required":true}}` },
  { widgetId: "form-field-group", category: "form", aliases: [], intents: ["form", "form group", "form fields", "contact form"], schema: `{ fields: [{ label: "First Name", placeholder: "John", type: "text" }, { label: "Email", placeholder: "john@example.com", type: "email" }] }`, examplePrompt: "create a compact contact form", exampleResponse: `{"widgetId":"form-field-group","category":"form","title":"Contact Form","widgetData":{"fields":[{"label":"First Name","placeholder":"John","type":"text"},{"label":"Last Name","placeholder":"Doe","type":"text"},{"label":"Email","placeholder":"john@example.com","type":"email"}]}}` },
  { widgetId: "tag-input", category: "form", aliases: [], intents: ["tag input", "tags", "labels input", "chips input"], schema: `{ label: "Tags", tags: ["Dashboard", "Analytics"], placeholder: "Add a tag..." }`, examplePrompt: "create a tags input", exampleResponse: `{"widgetId":"tag-input","category":"form","title":"Tag Input","widgetData":{"label":"Tags","tags":["Dashboard","Analytics"],"placeholder":"Add a tag..."}}` },
  { widgetId: "primary-button", category: "button", aliases: [], intents: ["button", "primary button", "cta", "call to action", "submit button"], schema: `{ label: "Save Changes", description: "Primary action button" }`, examplePrompt: "create a save button", exampleResponse: `{"widgetId":"primary-button","category":"button","title":"Save Button","widgetData":{"label":"Save Changes","description":"Primary action button"}}` },
  { widgetId: "button-group", category: "button", aliases: [], intents: ["button group", "actions", "toolbar actions", "multiple buttons"], schema: `{ buttons: [{ label: "Edit", variant: "outline" }, { label: "Share", variant: "outline" }, { label: "Delete", variant: "destructive" }] }`, examplePrompt: "create an action button group", exampleResponse: `{"widgetId":"button-group","category":"button","title":"Action Group","widgetData":{"buttons":[{"label":"Edit","variant":"outline"},{"label":"Share","variant":"outline"},{"label":"Delete","variant":"destructive"}]}}` },
  { widgetId: "icon-button-bar", category: "button", aliases: [], intents: ["icon buttons", "toolbar", "icon toolbar", "editor toolbar"], schema: `{ buttons: [{ tooltip: "Bold" }, { tooltip: "Italic" }, { tooltip: "Underline" }] }`, examplePrompt: "create a formatting toolbar", exampleResponse: `{"widgetId":"icon-button-bar","category":"button","title":"Formatting Toolbar","widgetData":{"buttons":[{"tooltip":"Bold"},{"tooltip":"Italic"},{"tooltip":"Underline"}]}}` },
  { widgetId: "split-button", category: "button", aliases: ["export-button", "pdf-button", "button-menu"], intents: ["split button", "export", "export pdf", "download", "button menu"], schema: `{ label: "Export" }`, examplePrompt: "create me a button export pdf", exampleResponse: `{"widgetId":"split-button","category":"button","title":"Export PDF","widgetData":{"label":"Export PDF"}}` },
  { widgetId: "toggle-button-group", category: "button", aliases: ["filter-button"], intents: ["toggle", "filter buttons", "filter chips", "view toggle", "segmented control"], schema: `{ options: ["Overview", "Details", "Activity"], selected: "Overview" }`, examplePrompt: "create a filter button group", exampleResponse: `{"widgetId":"toggle-button-group","category":"button","title":"Filter Controls","widgetData":{"options":["All","Open","Closed"],"selected":"All"}}` },
  { widgetId: "single-select-dropdown", category: "dropdown", aliases: ["select-dropdown", "filter-menu"], intents: ["dropdown", "select", "status filter", "single select", "filter menu"], schema: `{ label: "Filter by status", placeholder: "Select status", options: [{ value: "all", label: "All" }, { value: "active", label: "Active" }, { value: "draft", label: "Draft" }] }`, examplePrompt: "create a status filter dropdown", exampleResponse: `{"widgetId":"single-select-dropdown","category":"dropdown","title":"Status Filter","widgetData":{"label":"Filter by status","placeholder":"Select status","options":[{"value":"all","label":"All"},{"value":"active","label":"Active"},{"value":"draft","label":"Draft"}]}}` },
  { widgetId: "multi-select-dropdown", category: "dropdown", aliases: [], intents: ["multi select", "multi-select dropdown", "assign labels", "tag dropdown"], schema: `{ label: "Assign Labels", selected: ["bug", "feature"], options: [{ value: "bug", label: "Bug" }, { value: "feature", label: "Feature" }, { value: "urgent", label: "Urgent" }] }`, examplePrompt: "create a multi select label dropdown", exampleResponse: `{"widgetId":"multi-select-dropdown","category":"dropdown","title":"Label Selector","widgetData":{"label":"Assign Labels","selected":["bug","feature"],"options":[{"value":"bug","label":"Bug"},{"value":"feature","label":"Feature"},{"value":"urgent","label":"Urgent"}]}}` },
  { widgetId: "searchable-dropdown", category: "dropdown", aliases: [], intents: ["searchable dropdown", "combobox", "search select", "assignee dropdown"], schema: `{ label: "Assign teammate", placeholder: "Search teammates...", options: [{ value: "sarah", label: "Sarah Chen" }, { value: "leo", label: "Leo Park" }] }`, examplePrompt: "create a searchable assignee dropdown", exampleResponse: `{"widgetId":"searchable-dropdown","category":"dropdown","title":"Assignee Selector","widgetData":{"label":"Assign teammate","placeholder":"Search teammates...","options":[{"value":"sarah","label":"Sarah Chen"},{"value":"leo","label":"Leo Park"}]}}` },
  { widgetId: "sidebar-nav-menu", category: "menu", aliases: ["menu-button", "action-menu"], intents: ["menu", "navigation menu", "action menu", "sidebar menu", "quick actions"], schema: `{ title: "Quick Actions", items: [{ label: "Dashboard", icon: "LayoutDashboard" }, { label: "Reports", icon: "BarChart3" }, { label: "Settings", icon: "Settings" }] }`, examplePrompt: "create a quick actions menu", exampleResponse: `{"widgetId":"sidebar-nav-menu","category":"menu","title":"Quick Actions","widgetData":{"title":"Quick Actions","items":[{"label":"Dashboard","icon":"LayoutDashboard"},{"label":"Reports","icon":"BarChart3"},{"label":"Settings","icon":"Settings"}]}}` },
] as const;

function buildWidgetKnowledge(): string {
  console.log(`Debug flow: buildWidgetKnowledge fired with`, { widgetCount: SUPPORTED_WIDGETS.length });
  const categoryLines = SUPPORTED_WIDGET_CATEGORIES.map((category) => `- ${category}`).join("\n");
  const widgetLines = SUPPORTED_WIDGETS
    .map((widget) => `- "${widget.widgetId}" (${widget.category}) intents: ${widget.intents.join(", ")} schema: ${widget.schema}`)
    .join("\n");
  return `# Supported Widget Catalog

## Allowed Categories
${categoryLines}

## Allowed Widget IDs
${widgetLines}

Rules:
- You MUST choose a widgetId only from the allowed widget catalog above
- Match the user's intent to the closest allowed widget, even if the prompt uses loose wording
- Never invent a new widgetId outside this catalog
- Prefer existing search/button/dropdown/menu/form widgets for dashboard controls
- Use realistic sample data that matches the schema exactly`;
}

function buildWidgetExamples(): string {
  console.log(`Debug flow: buildWidgetExamples fired with`, {});
  const exampleWidgetIds = [
    "chart-bar",
    "chart-line",
    "orders-table",
    "search-bar",
    "search-with-filters",
    "primary-button",
    "toggle-button-group",
    "split-button",
    "single-select-dropdown",
    "searchable-dropdown",
    "sidebar-nav-menu",
    "text-input",
  ];
  return SUPPORTED_WIDGETS
    .filter((widget) => exampleWidgetIds.includes(widget.widgetId))
    .map((widget) => `Prompt: "${widget.examplePrompt}"\nResponse: ${widget.exampleResponse}`)
    .join("\n\n");
}

function findRelevantWidgets(promptLower: string) {
  console.log(`Debug flow: findRelevantWidgets fired with`, { promptLower });
  return SUPPORTED_WIDGETS
    .map((widget) => ({
      widget,
      score: widget.intents.reduce((total, intent) => total + (promptLower.includes(intent) ? 1 : 0), 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.widget);
}

function buildRelevantWidgetHint(promptLower: string): string {
  console.log(`Debug flow: buildRelevantWidgetHint fired with`, { promptLower });
  const relevantWidgets = findRelevantWidgets(promptLower);
  if (relevantWidgets.length === 0) {
    return "";
  }

  const hintLines = relevantWidgets
    .map((widget) => `- "${widget.widgetId}" (${widget.category}) because it matches intents: ${widget.intents.join(", ")}`)
    .join("\n");

  return `\n\n## Relevant Catalog Matches For This Prompt
${hintLines}

Choose the closest match from these relevant catalog entries if possible.`;
}

function normalizeWidgetId(widgetId: string): string {
  console.log(`Debug flow: normalizeWidgetId fired with`, { widgetId });
  const normalizedId = widgetId.trim().toLowerCase();
  for (const widget of SUPPORTED_WIDGETS) {
    const aliases = widget.aliases as readonly string[];
    if (widget.widgetId === normalizedId) {
      return widget.widgetId;
    }
    if (aliases.includes(normalizedId)) {
      return widget.widgetId;
    }
  }
  return widgetId;
}

function getWidgetCategory(widgetId: string): string | null {
  console.log(`Debug flow: getWidgetCategory fired with`, { widgetId });
  const matchedWidget = SUPPORTED_WIDGETS.find((widget) => widget.widgetId === widgetId);
  return matchedWidget?.category ?? null;
}

interface GenerateWidgetRequest {
  prompt: string;
}

interface GenerateWidgetResponse {
  ok: boolean;
  widget?: {
    widgetId: string;
    category: string;
    title: string;
    widgetData: Record<string, unknown>;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateWidgetResponse>> {
  const timestamp = new Date().toISOString();
  const logEntry = (msg: string, data?: unknown) => {
    const logLine = `[${timestamp}] ${msg}${data ? ': ' + JSON.stringify(data) : ''}`;
    console.log(logLine);
    // Also write to file
    try {
      const logPath = path.join(process.cwd(), '.logs', 'ai-widget-generation.log');
      fs.appendFileSync(logPath, logLine + '\n');
    } catch {
      // Silent fail if logging fails
    }
  };

  logEntry('POST /api/builder/ai-widget fired');

  try {
    const body = await request.json() as GenerateWidgetRequest;
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      logEntry('ERROR: prompt is required or invalid type', { prompt });
      return NextResponse.json({ ok: false, error: "prompt is required" }, { status: 400 });
    }

    logEntry('Received prompt', { prompt });

    const promptLower = prompt.toLowerCase();
    const widgetKnowledge = buildWidgetKnowledge();
    const widgetExamples = buildWidgetExamples();
    const relevantWidgetHint = buildRelevantWidgetHint(promptLower);
    const chartKnowledge = loadChartKnowledge();
    const tableKnowledge = loadTableKnowledge();
    const systemPrompt = `You are a widget generation assistant for a dashboard builder.

${widgetKnowledge}

---

## Chart & Widget Knowledge Base
${chartKnowledge}

---

## Table Widget Features & Configuration
${tableKnowledge}

Your task: Given a user's natural language prompt, generate a complete widget configuration.

Rules:
1. Select the most appropriate widgetId from the supported widget catalog based on the prompt intent
2. Generate realistic sample data that matches the exact schema for that widget type
3. Use appropriate colors (hex values for charts like #6366f1, #a855f7, or Tailwind classes for activity feeds like bg-emerald-500)
4. Generate 3-6 data points for charts/lists to make them look realistic
5. Use business-appropriate values and labels
6. If the prompt uses synonyms or loose wording, map it to the closest supported widgetId from the catalog
7. Never invent a widgetId outside the supported catalog
8. Respond ONLY with valid JSON in this exact format:
{
  "widgetId": "chart-bar",
  "category": "charts",
  "title": "Sales Analytics",
  "widgetData": { ...actual data matching the widget schema... }
}

Examples:
${widgetExamples}${relevantWidgetHint}

Now generate a widget for this prompt: "${prompt}"`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content?.trim() ?? "";
    logEntry('AI Response from Groq', { responseText });

    if (!responseText) {
      logEntry('ERROR: AI generated empty response');
      return NextResponse.json({ ok: false, error: "AI generated empty response" }, { status: 500 });
    }

    const widget = JSON.parse(responseText) as {
      widgetId: string;
      category: string;
      title: string;
      widgetData: Record<string, unknown>;
    };

    widget.widgetId = normalizeWidgetId(widget.widgetId);
    const normalizedCategory = getWidgetCategory(widget.widgetId);
    if (normalizedCategory) {
      widget.category = normalizedCategory;
    }

    logEntry('Parsed widget config', { widget });

    // Validate required fields
    if (!widget.widgetId || !widget.category || !widget.title || !widget.widgetData) {
      logEntry('ERROR: Widget missing required fields', {
        hasWidgetId: !!widget.widgetId,
        hasCategory: !!widget.category,
        hasTitle: !!widget.title,
        hasWidgetData: !!widget.widgetData
      });
      return NextResponse.json({ ok: false, error: "AI response missing required fields" }, { status: 500 });
    }

    logEntry('SUCCESS: Widget generated', { widgetId: widget.widgetId, category: widget.category, title: widget.title });

    return NextResponse.json({ ok: true, widget });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logEntry('ERROR: Exception in POST handler', { error: errorMessage, stack: err instanceof Error ? err.stack : '' });
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}
