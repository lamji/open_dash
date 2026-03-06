import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import * as LucideIcons from "lucide-react";
import type { GroqChatMessage } from "@/domain/builder/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const WIDGET_DATA_KNOWLEDGE = `
# Widget Data Update Rules — Open Dash Project

You are updating EXISTING widget data. Modify only what the user requests and preserve all other fields.
Return ONLY valid JSON — NO markdown, NO code fences, NO explanations.

---

## PROJECT WIDGET SCHEMAS (use these exact field names):

### revenue-chart — Vertical Bar Chart
{ "title": "Monthly Revenue", "bars": [50,65,80,100,75,90,110,95,85,120,105,130], "labels": ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] }
- bars[]: numeric values (heights relative to max). MUST be same length as labels[].
- labels[]: month/category strings. Full 12 months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

### activity-chart — Dense Bar Chart (no labels)
{ "title": "User Activity", "bars": [40,60,45,80,55,70,65,85,75,90,80,95] }
- bars[]: array of numbers only. No labels field.

### line-trend — Line/Area Trend Chart
{ "title": "Revenue Trend", "points": [20,35,28,45,38,55,48,62,55,70,65,78], "labels": ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] }
- points[]: numeric values. labels[] is optional (if empty, no axis labels shown).
- MUST be same length when both present.

### area-traffic — Area Traffic Chart (no labels)
{ "title": "Website Traffic", "points": [30,45,35,60,50,70,65,80,75,90,85,100] }
- points[]: array of numbers only. No labels field.

### horizontal-bar — Horizontal Bar Chart
{ "title": "Quarterly Performance", "bars": [{"label":"Q1","value":65},{"label":"Q2","value":80},{"label":"Q3","value":72},{"label":"Q4","value":91}] }
- bars[]: array of {label: string, value: number} objects — NOT plain numbers.
- Values are absolute; widths calculated as % of max.

### stacked-bar — Multi-Series Stacked Bar
{ "title": "Revenue by Channel", "groups": [{"label":"Jan","a":40,"b":30,"c":20},{"label":"Feb","a":45,"b":35,"c":25},{"label":"Mar","a":50,"b":32,"c":28}], "legend": ["Organic","Paid","Email"] }
- groups[]: each item has label + exactly 3 values: a, b, c
- legend[]: 3 series names mapping to a, b, c respectively

### traffic-pie — Pie Chart
{ "title": "Traffic Sources", "segments": [{"label":"Direct","value":"45%","pct":45,"color":"#6366f1"},{"label":"Organic","value":"30%","pct":30,"color":"#a855f7"},{"label":"Social","value":"15%","pct":15,"color":"#ec4899"},{"label":"Email","value":"10%","pct":10,"color":"#f59e0b"}] }
- segments[]: {label: string, value: "XX%" string, pct: number, color: hex}
- All pct values MUST sum to 100.

### donut-budget — Doughnut Chart
{ "title": "Budget Allocation", "segments": [{"label":"Engineering","value":40,"color":"#6366f1"},{"label":"Marketing","value":35,"color":"#a855f7"},{"label":"Sales","value":15,"color":"#ec4899"},{"label":"Other","value":10,"color":"#f59e0b"}] }
- segments[]: {label: string, value: number (not string), color: hex}. Values sum to 100.
- Different from traffic-pie: value is a NUMBER here, no pct field.

### channel-attribution — Channel Horizontal Bars
{ "title": "Channel Attribution", "channels": [{"label":"Organic","value":35,"pct":35,"color":"#6366f1"},{"label":"Paid","value":28,"pct":28,"color":"#a855f7"},{"label":"Email","value":22,"pct":22,"color":"#ec4899"},{"label":"Referral","value":15,"pct":15,"color":"#f59e0b"}] }
- channels[]: {label, value (number), pct (0-100), color (hex)}

### region-breakdown — Regional Breakdown Bars
{ "title": "Regional Breakdown", "regions": [{"name":"North America","value":"45%","pct":45,"color":"#6366f1"},{"name":"Europe","value":"30%","pct":30,"color":"#a855f7"},{"name":"Asia Pacific","value":"18%","pct":18,"color":"#ec4899"},{"name":"Other","value":"7%","pct":7,"color":"#f59e0b"}] }
- regions[]: {name (not label), value: "XX%" string, pct (0-100), color (hex)}

### heatmap — Activity Heatmap Grid
{ "title": "Performance Heatmap", "cells": 35, "palette": ["bg-slate-100","bg-emerald-200","bg-emerald-400","bg-emerald-600"] }
- cells: total grid cells (35 = 5 rows × 7 cols)
- palette: Tailwind bg classes from low to high intensity

### sales-target / goal-tracker — Progress Widgets
{ "label": "Sales Target", "pct": 75, "currentLabel": "$75,000", "targetLabel": "$100,000" }

### Stats Widgets (total-revenue, active-users, etc.)
{ "value": "$12,345", "label": "Total Revenue", "change": "+12.5%", "up": true, "period": "vs last month" }

### Button Widgets (button/* category)
- Common fields supported by button widgets in this project:
  - label: string
  - icon: lucide icon name string (examples: "ArrowUpRight", "Plus", "Upload", "Download", "FileText", "ChevronDown")
  - buttonBgColor: CSS color string (hex/rgb/hsl/color name)
  - buttonTextColor: CSS color string
  - iconColor: CSS color string
  - arrowBgColor: CSS color string (split-button only)
- If user asks to change button color/background/text/icon, update these fields.
- Always preserve existing fields not requested.

---

## UPDATE RULES:

1. "complete the months" / "add all months" / "show all months":
   → For revenue-chart/line-trend: set labels to all 12: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] and generate matching bars/points of equal length.

2. "make it a line chart" / "change to line":
   → Change widgetId to line-trend, rename bars→points, keep labels.

3. "change colors" / "make it blue":
   → Update color hex values in segments/channels/regions arrays.

4. "add segment/channel/region":
   → Add new item, reduce other pct values proportionally so total = 100.

5. "add data" / "add month":
   → Append to both bars/points AND labels arrays (must stay equal length).

6. "change title":
   → Update title field only.

7. For button widgets, icon names must be valid Lucide names in PascalCase (e.g. ArrowUpRight, Plus, Upload, Download).
8. ALWAYS preserve ALL fields not mentioned by user.
9. bars[] and labels[] MUST always be the same length for revenue-chart and line-trend.
10. Use these colors: #6366f1, #a855f7, #ec4899, #f59e0b, #10b981, #3b82f6, #06b6d4, #f43f5e, #f97316, #14b8a6
`;

interface WidgetUpdateRequest {
  blockId: string;
  slotIdx: number;
  currentWidgetData: Record<string, unknown>;
  widgetId: string;
  category: string;
  message: string;
  history: GroqChatMessage[];
  mode?: "data" | "config";
  promptContext?: string;
}

interface WidgetUpdateResponse {
  ok: boolean;
  widgetData?: Record<string, unknown>;
  error?: string;
}

function isValidLucideIconName(iconName: string): boolean {
  console.log(`Debug flow: isValidLucideIconName fired with`, { iconName });
  const result = Object.prototype.hasOwnProperty.call(LucideIcons, iconName);
  console.log(`Debug flow: isValidLucideIconName result`, { iconName, result });
  return result;
}

export async function POST(request: NextRequest): Promise<NextResponse<WidgetUpdateResponse>> {
  console.log(`Debug flow: POST /api/builder/ai-widget-update fired`);

  try {
    const body = await request.json() as WidgetUpdateRequest;
    const { currentWidgetData, widgetId, category, message, history, mode, promptContext } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ ok: false, error: "message is required" }, { status: 400 });
    }

    console.log(`Debug flow: POST /api/builder/ai-widget-update params`, { 
      widgetId, 
      category, 
      currentDataKeys: Object.keys(currentWidgetData),
      hasPromptContext: !!promptContext,
    });

    const tableConfigKnowledge = mode === "config" ? `
## CONFIG MODE — Table Widget Configuration
When in config mode (mode="config"), you may modify:
- Row structure: add/edit/remove rows
- Column headers/names: add new columns, rename existing ones
- Cell values and statuses
- Status colors and styling values
- Sorting/pagination metadata (if widget supports it)
- Widget title and labels

For table widgets (orders-table, customers-table, transactions-table, inventory-table), the "rows" array structure is the primary data point. You can expand rows, add new fields to each row object, or change values.

IMPORTANT TABLE SCHEMA (use exact shape):
{
  "title": "Recent Orders",
  "rows": [{ "id": "#1234", "customer": "Alice", "amount": "$230.00", "status": "Completed" }],
  "features": {
    "sorting": true,
    "filtering": true,
    "pagination": true,
    "columnVisibility": true,
    "columnResizing": true,
    "rowSelection": true,
    "expandableRows": false
  },
  "pageSize": 10
}

If user asks to enable/disable sorting/pagination/filtering, update "features" fields (NOT top-level keys).
` : "";

    const systemPrompt = `${WIDGET_DATA_KNOWLEDGE}
${tableConfigKnowledge}

CURRENT WIDGET:
- Widget ID: ${widgetId}
- Category: ${category}
${mode === "config" ? "- Mode: CONFIG (widget configuration/structure)" : mode === "data" ? "- Mode: DATA (widget values/content)" : ""}

CURRENT WIDGET DATA:
${JSON.stringify(currentWidgetData, null, 2)}
${promptContext ? `

LIVE BUILDER CONTEXT SNAPSHOT:
${promptContext}
` : ""}

USER REQUEST: "${message}"

Your task: Update the widget data based on the user's request. Return ONLY the complete updated widgetData object as valid JSON. Include ALL fields (modified and unmodified).

Rules:
1. Respond with ONLY valid JSON - no markdown, no code fences, no explanations
2. Preserve all fields that aren't being modified
3. Match the exact schema of the current widget
4. Use realistic values for any new data points
5. For month labels, use: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
6. For colors, use hex values like #3b82f6, #8b5cf6, #10b981, etc.
7. For button icon updates, use ONLY valid Lucide icon names in PascalCase. Never invent icon names.`;

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.3,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content?.trim() ?? "";
    console.log(`Debug flow: POST /api/builder/ai-widget-update groq response`, { 
      responseLength: responseText.length 
    });

    if (!responseText) {
      return NextResponse.json({ ok: false, error: "AI generated empty response" }, { status: 500 });
    }

    const updatedWidgetData = JSON.parse(responseText) as Record<string, unknown>;
    const proposedIcon = typeof updatedWidgetData.icon === "string"
      ? updatedWidgetData.icon.trim()
      : "";
    if (proposedIcon && !isValidLucideIconName(proposedIcon)) {
      const fallbackIcon = typeof currentWidgetData.icon === "string"
        ? currentWidgetData.icon.trim()
        : "";
      console.warn(`Debug flow: Invalid Lucide icon from AI, reverting`, {
        proposedIcon,
        fallbackIcon,
      });
      if (fallbackIcon && isValidLucideIconName(fallbackIcon)) {
        updatedWidgetData.icon = fallbackIcon;
      } else {
        delete updatedWidgetData.icon;
      }
    }

    console.log(`Debug flow: POST /api/builder/ai-widget-update success`, { 
      updatedKeys: Object.keys(updatedWidgetData) 
    });

    return NextResponse.json({ ok: true, widgetData: updatedWidgetData });
  } catch (err) {
    console.error(`Debug flow: POST /api/builder/ai-widget-update error`, err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}
