import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { GroqChatMessage } from "@/domain/builder/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildWidgetVisualDescription(
  widgetId: string,
  category: string,
  widgetData: Record<string, unknown>
): string {
  const slug = widgetId;
  const lines: string[] = ["VISUAL STRUCTURE:"];

  // Category-level descriptions
  const categoryDescriptions: Record<string, string> = {
    stats: "Renders a stat card with a large value, label text, change indicator (up/down arrow), and period text. Uses Tailwind text classes for sizing.",
    charts: "",
    progress: "Renders progress bars using shadcn <Progress> component with percentage labels.",
    activity: "Renders a vertical feed of items, each with a colored dot indicator, text, and timestamp.",
    comparison: "Renders comparison cards with current vs previous values and up/down trend arrows.",
    health: "Renders service status items with colored dot indicators (green=operational, yellow=degraded).",
    timeline: "Renders a vertical timeline with colored dots and border-left connectors.",
    list: "Renders ranked/scored items with progress bars or inline bar charts.",
    table: "Renders a <table> with thead/tbody, using Tailwind table-fixed and text-xs classes.",
    funnel: "Renders horizontal funnel bars with percentage widths and gradient backgrounds.",
    leaderboard: "Renders ranked entries with avatar circles, names, scores, and trophy icons.",
    summary: "Renders a 2-column grid of KPI cards with labels, values, and trend indicators.",
    button: "Renders button elements with Tailwind bg-blue-600 text-white and variant styles.",
    dropdown: "Renders select triggers with option lists, using border/rounded-lg styling.",
    menu: "Renders navigation items with icons, labels, and active state highlighting.",
    search: "Renders search input fields with icons, keyboard shortcuts, and filter chips.",
    form: "Renders form fields with labels, inputs, and helper text.",
  };

  // Widget-specific visual descriptions
  const widgetDescriptions: Record<string, string> = {
    "revenue-chart": "Bar chart: vertical bars using flex items-end, each bar has inline style height (percentage) and background (hsl gradient). Labels below.",
    "activity-chart": "Bar chart: dense vertical bars with bg-gradient-to-t from-blue-600 to-blue-300. Height set via inline style percentage.",
    "traffic-pie": "Pie chart: circular div with conic-gradient() built from segments[].color (hex). Legend items with colored dots beside it.",
    "donut-budget": "Donut chart: circular div with conic-gradient() and an inner white circle (absolute inset-2). Legend shows top 3 segments.",
    "heatmap": "Grid of colored squares (grid-cols-7), colors from palette[] array as Tailwind bg classes.",
    "line-trend": "Area/bar visualization: vertical bars with bg-emerald-400 rounded-t-sm, height from percentage of max value.",
    "area-traffic": "Area visualization: vertical bars with bg-gradient-to-t from-cyan-600 to-cyan-200.",
    "horizontal-bar": "Horizontal bars: bg-slate-100 track with bg-violet-500 fill, width set by percentage.",
    "stacked-bar": "Stacked vertical bars: flex-col-reverse groups, each segment colored (bg-violet-500, bg-blue-400, bg-cyan-400).",
    "channel-attribution": "Horizontal bars with inline background color from channels[].color (hex values).",
    "region-breakdown": "Horizontal bars with inline background color from regions[].color (hex values).",
    "weekly-summary": "2-column grid of colored metric cards. Colors from colorMap: blue/emerald/violet/orange mapped to bg-*-50 text-*-700.",
    "executive-summary": "2-column grid of KPI cards (bg-slate-50 rounded-lg) with trend indicators (text-emerald-600 or text-red-500).",
    "monthly-metrics": "2-column grid of metric cards (bg-slate-50) with label and bold value.",
    "conversion-funnel": "Horizontal funnel bars with bg-gradient-to-r from-amber-400 to-amber-300, width = pct%.",
    "sales-pipeline": "Horizontal funnel bars with hsl() computed backgrounds getting darker per stage.",
  };

  if (categoryDescriptions[category]) {
    lines.push(`Category "${category}": ${categoryDescriptions[category]}`);
  }
  if (widgetDescriptions[slug]) {
    lines.push(`Widget "${slug}": ${widgetDescriptions[slug]}`);
  }

  // Add color information from widgetData
  if (widgetData.segments && Array.isArray(widgetData.segments)) {
    const segs = widgetData.segments as { color?: string; label?: string }[];
    const colors = segs.filter(s => s.color).map(s => `${s.label}: ${s.color}`);
    if (colors.length > 0) {
      lines.push(`Current chart colors: ${colors.join(", ")}`);
    }
  }
  if (widgetData.palette && Array.isArray(widgetData.palette)) {
    lines.push(`Current palette classes: ${(widgetData.palette as string[]).join(", ")}`);
  }
  if (widgetData.channels && Array.isArray(widgetData.channels)) {
    const chs = widgetData.channels as { color?: string; label?: string }[];
    const colors = chs.filter(c => c.color).map(c => `${c.label}: ${c.color}`);
    if (colors.length > 0) {
      lines.push(`Current channel colors: ${colors.join(", ")}`);
    }
  }
  if (widgetData.regions && Array.isArray(widgetData.regions)) {
    const regs = widgetData.regions as { color?: string; name?: string }[];
    const colors = regs.filter(r => r.color).map(r => `${r.name}: ${r.color}`);
    if (colors.length > 0) {
      lines.push(`Current region colors: ${colors.join(", ")}`);
    }
  }

  // General structure info
  lines.push("Outer wrapper: flex flex-col h-full gap-2 (fills parent container).");
  lines.push("Title row: text-sm font-bold text-slate-800 with a Lucide icon (w-4 h-4).");

  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  console.log(`Debug flow: POST /api/builder/ai-style fired`);

  try {
    const body = await request.json();
    const { blockId, slotIdx, blockType, currentCss, message, history, widget, mode } = body as {
      blockId: string;
      slotIdx: number;
      blockType: string;
      currentCss: string;
      message: string;
      history: GroqChatMessage[];
      widget?: {
        widgetId: string;
        category: string;
        title: string;
        widgetData: Record<string, unknown>;
      };
      mode?: "styles";
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json({ ok: false, error: "message is required" }, { status: 400 });
    }

    console.log(`Debug flow: POST /api/builder/ai-style params`, { blockId, slotIdx, blockType, currentCss, widget });

    const isBlockLevel = slotIdx < 0;
    const targetLabel = isBlockLevel
      ? `block wrapper for block ${blockId}`
      : `column ${slotIdx + 1} of block ${blockId}`;
    const targetElementId = isBlockLevel
      ? `builder-block-${blockId}`
      : `builder-slot-${blockId}-${slotIdx}`;

    const widgetInfo = !isBlockLevel && widget ? `

WIDGET CONTENT:
This column contains a "${widget.title}" widget (ID: ${widget.widgetId}, Category: ${widget.category}).

WIDGET DATA (all configurable properties):
${JSON.stringify(widget.widgetData, null, 2)}

${buildWidgetVisualDescription(widget.widgetId, widget.category, widget.widgetData)}

STYLING CAPABILITIES:
- You style the CONTAINER wrapping this widget. CSS you output is applied to the column div.
- Container styles: background, padding, border-radius, box-shadow, border, margin, overflow, opacity, backdrop-filter
- **COLUMN LAYOUT CONTROLS (for wrapping/positioning content):**
  - display: flex (enables flexbox layout for the column)
  - flex-direction: column | row (vertical or horizontal stacking)
  - align-items: flex-start | center | flex-end | stretch (cross-axis alignment)
  - justify-content: flex-start | center | flex-end | space-between | space-around (main-axis alignment)
  - gap: 8px | 16px | 24px (spacing between child elements)
  - Example: "display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 16px;"
- Color theming: background-color, background-image (gradients), color (text)
- The widget renders INSIDE this container using Tailwind classes and inline styles.
- Chart colors come from widgetData (segments[].color as hex, or inline hsl() in bars). To change chart colors, the widgetData must be updated — container CSS alone cannot override inline styles on inner elements.
- Progress bars use shadcn <Progress> component.` : `

${isBlockLevel ? "You are styling the OUTER BLOCK WRAPPER, not an inner column." : "This column is currently EMPTY (no widget placed yet). You can style it with any CSS properties."}

**${isBlockLevel ? "BLOCK WRAPPER" : "COLUMN"} LAYOUT CONTROLS:**
When styling this ${isBlockLevel ? "wrapper" : "column"}, you can control how content will be positioned:
- display: flex (enables flexbox layout)
- flex-direction: column | row (vertical or horizontal stacking)
- align-items: flex-start | center | flex-end | stretch (cross-axis alignment)
- justify-content: flex-start | center | flex-end | space-between (main-axis alignment)
- gap: 8px | 16px | 24px (spacing between elements)
- Example: "display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;"`;

    const systemPrompt = `You are a CSS assistant for a dashboard column editor.
${mode === "styles" ? "\n⚠️ MODE: User explicitly requested CSS styling with /styles command. Focus purely on CSS-based styling." : ""}

TARGET ELEMENT:
- Layout Type: "${blockType}"
- Target: ${targetLabel}
- ${isBlockLevel ? "Block-level target (no slot index)" : `Column Position: ${slotIdx + 1} (slot index ${slotIdx})`}
- Unique Element ID: ${targetElementId}
- Block ID: ${blockId}
${widgetInfo}

You are styling THIS SPECIFIC ${isBlockLevel ? "BLOCK WRAPPER" : "COLUMN"} ONLY. The styles you generate will be applied directly to the DOM element with data-test-id="${targetElementId}".

Current CSS applied to this ${isBlockLevel ? "block wrapper" : "column"}:
\`\`\`
${currentCss || "(no styles yet)"}
\`\`\`

Rules:
1. Respond ONLY with valid CSS property declarations, e.g.: background-color: red; padding: 8px;
2. Do NOT include selectors, curly braces, code fences, or explanations.
3. If the user asks to change a property that already exists in Current CSS, include the updated value.
4. If the user asks to "revert", "remove", or "clear" styles, output ALL current properties with empty string values (e.g.: background-color: ; padding: ;).
5. Output only the properties that need to be added, changed, or removed.
6. Remember: You are styling ${targetLabel}. These styles will ONLY affect this specific ${isBlockLevel ? "block wrapper" : "column"}.`;

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.3,
      max_tokens: 256,
    });

    const css = completion.choices[0]?.message?.content?.trim() ?? "";
    console.log(`Debug flow: POST /api/builder/ai-style groq response`, { css });

    return NextResponse.json({ ok: true, css });
  } catch (err) {
    console.error(`Debug flow: POST /api/builder/ai-style error`, err);
    return NextResponse.json({ ok: false, error: "AI style generation failed" }, { status: 500 });
  }
}
