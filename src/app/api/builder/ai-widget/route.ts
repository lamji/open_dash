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

const WIDGET_KNOWLEDGE = `
# Widget Types and Data Structures

## Available Widget Categories:
- stats: Stats & KPIs (single value displays with change indicators)
- charts: Bar charts, pie charts, line charts, area charts, heatmaps
- progress: Progress bars and goal trackers
- activity: Activity feeds, error logs, notifications
- comparison: Side-by-side comparisons, YoY data
- health: System health, API latency, uptime monitors
- timeline: Event timelines
- list: Top products, team performance, ranked lists
- table: Data tables with rows and columns
- funnel: Conversion funnels, sales pipelines
- leaderboard: Agent/product leaderboards with rankings
- summary: Executive summaries, KPI scorecards
- button: Button widgets
- dropdown: Dropdown selectors
- menu: Navigation menus
- search: Search bars and filters
- form: Form inputs

## Customization Options (All Widgets):

### Icon Customization
Any widget can include an optional "icon" field with a valid Lucide React icon name (PascalCase).
Valid icon names: DollarSign, Users, Target, ShoppingCart, TrendingUp, TrendingDown, Activity, Clock, Zap, Star, BarChart3, Calendar, PieChart, AlertTriangle, Trophy, Heart, CheckCircle, AlertCircle, ArrowUp, ArrowDown, and 200+ others from Lucide.
When user requests to use a specific icon (e.g., "with a heart icon" or "use the trophy icon"), include "icon": "IconName" in widgetData.

### Title Customization
Chart and progress widgets accept a "title" field to set the header text.
When user says "change title to X" or "titled X" for any chart or progress widget, update the "title" field.

## Common Widget IDs and Their Data Structures:

### Stats Widgets (support optional icon field):
- "total-revenue": { value: "$12,345", label: "Total Revenue", icon: "DollarSign", change: "+12.5%", up: true, period: "vs last month" }
- "active-users": { value: "1,234", label: "Active Users", icon: "Users", change: "+8%", up: true, period: "this week" }

### Chart Widgets (support title and optional icon):
- "chart-bar": { title: "Monthly Revenue", icon: "BarChart3", xKey: "month", bars: [{ dataKey: "revenue", label: "Revenue", color: "#3b82f6" }], data: [{ month: "Jan", revenue: 50 }, { month: "Feb", revenue: 65 }] }
- "traffic-pie": { title: "Traffic Sources", icon: "PieChart", segments: [{ label: "Direct", value: "45%", pct: 45, color: "#6366f1" }, { label: "Organic", value: "30%", pct: 30, color: "#a855f7" }] }
- "chart-line": { title: "Revenue Trend", icon: "TrendingUp", xKey: "month", lines: [{ dataKey: "revenue", label: "Revenue", color: "#3b82f6" }], data: [{ month: "Jan", revenue: 20 }, { month: "Feb", revenue: 35 }] }

### Progress Widgets:
- "sales-target": { label: "Sales Target", pct: 75, currentLabel: "$75,000", targetLabel: "$100,000" }
- "goal-tracker": { title: "Quarterly Goals", goals: [{ name: "Revenue", pct: 85 }, { name: "Users", pct: 70 }] }

### Activity Widgets:
- "activity-feed": { items: [{ color: "bg-emerald-500", text: "New user signed up", time: "2 min ago" }] }
- "error-log": { items: [{ level: "error", message: "TypeError in /api/widgets", time: "5 min ago" }] }

### List Widgets:
- "top-products": { items: [{ name: "Widget Pro", sales: 234, pct: 95 }] }
- "team-performance": { members: [{ name: "Alice", score: 95 }] }

### Funnel Widgets:
- "conversion-funnel": { title: "Conversion Funnel", stages: [{ label: "Visitors", value: 10000, pct: 100 }, { label: "Sign-ups", value: 2400, pct: 24 }] }

### Summary Widgets:
- "executive-summary": { title: "Executive Summary", kpis: [{ label: "Revenue", value: "$892K", trend: "+12%", up: true }] }
- "monthly-metrics": { month: "This Month", metrics: [{ label: "Total Sales", value: "$124,500" }] }
`;

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
    let chartTypeHint = "";
    
    if (promptLower.includes("line chart") || promptLower.includes("line graph") || promptLower.includes("trend line")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested a LINE CHART. You MUST use widgetId: \"chart-line\" with schema: { title, xKey: \"month\", lines: [{ dataKey: \"value\", label: \"Sales\", color: \"#3b82f6\" }], data: [{ month: \"Jan\", value: 100 }, ...] }. DO NOT use bar charts.**";
    } else if (promptLower.includes("area chart") || promptLower.includes("area graph")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested an AREA CHART. Use chart-line as the closest alternative. Schema: { title, xKey: \"month\", lines: [{ dataKey: \"value\", label: \"Value\", color: \"#3b82f6\" }], data: [{ month: \"Jan\", value: 100 }, ...] }.**";
    } else if (promptLower.includes("pie chart") || promptLower.includes("pie graph")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested a PIE CHART. Pie charts not yet implemented. Use chart-bar as fallback. Schema: { title, xKey: \"name\", bars: [{ dataKey: \"value\", label: \"Value\", color: \"#3b82f6\" }], data: [{ name: \"A\", value: 100 }, ...] }.**";
    } else if (promptLower.includes("bar chart") || promptLower.includes("bar graph") || promptLower.includes("vertical bar")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested a BAR CHART. You MUST use widgetId: \"chart-bar\" with schema: { title, xKey: \"month\", bars: [{ dataKey: \"value\", label: \"Value\", color: \"#3b82f6\" }], data: [{ month: \"Jan\", value: 100 }, ...] }.**";
    } else if (promptLower.includes("horizontal bar")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested a HORIZONTAL BAR CHART. Use chart-bar with horizontal orientation or describe as vertical bars. Schema: { title, xKey: \"category\", bars: [{ dataKey: \"value\", label: \"Value\", color: \"#3b82f6\" }], data: [{ category: \"A\", value: 100 }, ...] }.**";
    } else if (promptLower.includes("donut") || promptLower.includes("doughnut")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested a DONUT CHART. Use chart-line as alternative or fallback. Pie/donut charts not yet fully implemented.**";
    } else if (promptLower.includes("heatmap") || promptLower.includes("heat map")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested a HEATMAP. Use chart-bar as fallback. Heatmaps not yet fully implemented.**";
    }

    const chartKnowledge = loadChartKnowledge();
    const systemPrompt = `You are a widget generation assistant for a dashboard builder.

${WIDGET_KNOWLEDGE}

---

## Chart & Widget Knowledge Base
${chartKnowledge}

Your task: Given a user's natural language prompt, generate a complete widget configuration.

Rules:
1. Select the most appropriate widgetId from the list above based on the prompt intent
2. Generate realistic sample data that matches the exact schema for that widget type
3. Use appropriate colors (hex values for charts like #6366f1, #a855f7, or Tailwind classes for activity feeds like bg-emerald-500)
4. Generate 3-6 data points for charts/lists to make them look realistic
5. Use business-appropriate values and labels
6. Respond ONLY with valid JSON in this exact format:
{
  "widgetId": "revenue-chart",
  "category": "charts",
  "title": "Sales Analytics",
  "widgetData": { ...actual data matching the widget schema... }
}

Examples:
Prompt: "create me a sales analytics"
Response: {"widgetId":"chart-bar","category":"charts","title":"Sales Analytics","widgetData":{"title":"Monthly Sales","xKey":"month","bars":[{"dataKey":"sales","label":"Sales","color":"#3b82f6"}],"data":[{"month":"Jan","sales":65},{"month":"Feb","sales":78},{"month":"Mar","sales":82},{"month":"Apr","sales":95},{"month":"May","sales":88},{"month":"Jun","sales":92}]}}

Prompt: "show top performing products"
Response: {"widgetId":"top-products","category":"list","title":"Top Products","widgetData":{"items":[{"name":"Premium Plan","sales":342,"pct":95},{"name":"Starter Plan","sales":289,"pct":80},{"name":"Enterprise Plan","sales":156,"pct":43}]}}

Prompt: "create analytics for sales with line chart"
Response: {"widgetId":"chart-line","category":"charts","title":"Sales Analytics","widgetData":{"title":"Monthly Sales Trend","xKey":"month","lines":[{"dataKey":"sales","label":"Sales","color":"#3b82f6"}],"data":[{"month":"Jan","sales":45},{"month":"Feb","sales":52},{"month":"Mar","sales":48},{"month":"Apr","sales":61},{"month":"May","sales":58},{"month":"Jun","sales":70},{"month":"Jul","sales":65},{"month":"Aug","sales":78},{"month":"Sep","sales":72},{"month":"Oct","sales":85},{"month":"Nov","sales":80},{"month":"Dec","sales":92}]}}${chartTypeHint}

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
