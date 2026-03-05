import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

## Common Widget IDs and Their Data Structures:

### Stats Widgets:
- "total-revenue": { value: "$12,345", label: "Total Revenue", change: "+12.5%", up: true, period: "vs last month" }
- "active-users": { value: "1,234", label: "Active Users", change: "+8%", up: true, period: "this week" }

### Chart Widgets:
- "revenue-chart": { title: "Monthly Revenue", bars: [50,65,80,100,75,90], labels: ["Jan","Feb","Mar","Apr","May","Jun"] }
- "traffic-pie": { title: "Traffic Sources", segments: [{ label: "Direct", value: "45%", pct: 45, color: "#6366f1" }, { label: "Organic", value: "30%", pct: 30, color: "#a855f7" }] }
- "line-trend": { title: "Revenue Trend", points: [20,35,28,45,38,55,48,62,55,70,65,78], labels: ["Jan","Feb","Mar"] }

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
  console.log(`Debug flow: POST /api/builder/ai-widget fired`);

  try {
    const body = await request.json() as GenerateWidgetRequest;
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ ok: false, error: "prompt is required" }, { status: 400 });
    }

    console.log(`Debug flow: POST /api/builder/ai-widget params`, { prompt });

    const promptLower = prompt.toLowerCase();
    let chartTypeHint = "";
    
    if (promptLower.includes("line chart") || promptLower.includes("line graph") || promptLower.includes("trend line")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested a LINE CHART. You MUST use widgetId: \"line-trend\" with schema: { title, points: [], labels: [] }. DO NOT use revenue-chart or any bar chart.**";
    } else if (promptLower.includes("area chart") || promptLower.includes("area graph")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested an AREA CHART. You MUST use widgetId: \"area-traffic\" with schema: { title, points: [] }. DO NOT use bar charts.**";
    } else if (promptLower.includes("pie chart") || promptLower.includes("pie graph")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested a PIE CHART. You MUST use widgetId: \"traffic-pie\" with schema: { title, segments: [{ label, value, pct, color }] }. DO NOT use bar charts.**";
    } else if (promptLower.includes("bar chart") || promptLower.includes("bar graph") || promptLower.includes("vertical bar")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested a BAR CHART. You MUST use widgetId: \"revenue-chart\" with schema: { title, bars: [], labels: [] }.**";
    } else if (promptLower.includes("horizontal bar")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested a HORIZONTAL BAR CHART. You MUST use widgetId: \"horizontal-bar\" with schema: { title, bars: [{ label, value }] }.**";
    } else if (promptLower.includes("donut") || promptLower.includes("doughnut")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested a DONUT CHART. You MUST use widgetId: \"donut-budget\" with schema: { title, segments: [{ label, value, color }] }.**";
    } else if (promptLower.includes("heatmap") || promptLower.includes("heat map")) {
      chartTypeHint = "\n\n**CRITICAL: User explicitly requested a HEATMAP. You MUST use widgetId: \"heatmap\" with schema: { title, cells: 35, palette: [] }.**";
    }

    const systemPrompt = `You are a widget generation assistant for a dashboard builder.

${WIDGET_KNOWLEDGE}

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
Response: {"widgetId":"revenue-chart","category":"charts","title":"Sales Analytics","widgetData":{"title":"Monthly Sales","bars":[65,78,82,95,88,92],"labels":["Jan","Feb","Mar","Apr","May","Jun"]}}

Prompt: "show top performing products"
Response: {"widgetId":"top-products","category":"list","title":"Top Products","widgetData":{"items":[{"name":"Premium Plan","sales":342,"pct":95},{"name":"Starter Plan","sales":289,"pct":80},{"name":"Enterprise Plan","sales":156,"pct":43}]}}

Prompt: "create analytics for sales with line chart"
Response: {"widgetId":"line-trend","category":"charts","title":"Sales Analytics","widgetData":{"title":"Monthly Sales Trend","points":[45,52,48,61,58,70,65,78,72,85,80,92],"labels":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]}}${chartTypeHint}

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
    console.log(`Debug flow: POST /api/builder/ai-widget groq response`, { responseText });

    if (!responseText) {
      return NextResponse.json({ ok: false, error: "AI generated empty response" }, { status: 500 });
    }

    const widget = JSON.parse(responseText) as {
      widgetId: string;
      category: string;
      title: string;
      widgetData: Record<string, unknown>;
    };

    // Validate required fields
    if (!widget.widgetId || !widget.category || !widget.title || !widget.widgetData) {
      return NextResponse.json({ ok: false, error: "AI response missing required fields" }, { status: 500 });
    }

    console.log(`Debug flow: POST /api/builder/ai-widget success`, { widgetId: widget.widgetId });

    return NextResponse.json({ ok: true, widget });
  } catch (err) {
    console.error(`Debug flow: POST /api/builder/ai-widget error`, err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}
