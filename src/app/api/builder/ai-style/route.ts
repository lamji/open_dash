import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { GroqChatMessage } from "@/domain/builder/types";
import { buildWidgetSpecPrompt, getWidgetSpec } from "@/lib/widget-spec-registry";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface ClarificationDecision {
  needsClarification: boolean;
  clarificationQuestion?: string;
}

interface WidgetInfo {
  widgetId: string;
  category: string;
  title: string;
  widgetData: Record<string, unknown>;
}

const BUTTON_POSITION_CLARIFICATION =
  "Do you want to move the whole button to the right side of the container, or keep it in place and only right-align text/icon inside the button?";

const COLOR_STYLE_PROPS = new Set([
  "color",
  "background",
  "background-color",
  "border-color",
  "outline-color",
  "text-decoration-color",
  "fill",
  "stroke",
  "caret-color",
]);

function normalizeBareHexForColorProperty(prop: string, val: string): string {
  console.log(`Debug flow: normalizeBareHexForColorProperty fired with`, { prop, val });
  if (!COLOR_STYLE_PROPS.has(prop)) {
    return val;
  }
  const trimmed = val.trim();
  if (trimmed.startsWith("#")) {
    return trimmed;
  }
  const bareHexMatch = trimmed.match(/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
  const result = bareHexMatch ? `#${bareHexMatch[1]}` : trimmed;
  console.log(`Debug flow: normalizeBareHexForColorProperty result`, { result });
  return result;
}

function sanitizeGeneratedCss(css: string): string {
  console.log(`Debug flow: sanitizeGeneratedCss fired with`, { cssLength: css.length });
  if (!css.trim()) {
    return css;
  }
  const normalized = css
    .replace(/,\s*\n\s*/g, "; ")
    .replace(/\n\s*/g, "; ")
    .replace(/\r/g, "");
  const declarations: string[] = [];
  normalized.split(";").forEach((decl) => {
    const colonIdx = decl.indexOf(":");
    if (colonIdx === -1) return;
    const prop = decl.slice(0, colonIdx).trim().toLowerCase();
    const rawVal = decl.slice(colonIdx + 1).trim();
    if (!prop || !rawVal) return;
    const val = normalizeBareHexForColorProperty(prop, rawVal);
    declarations.push(`${prop}: ${val}`);
  });
  const result = declarations.join("; ");
  console.log(`Debug flow: sanitizeGeneratedCss result`, {
    declarationCount: declarations.length,
    resultLength: result.length,
  });
  return result;
}

function detectAmbiguousStyleIntent(
  message: string,
  widgetCategory?: string
): ClarificationDecision {
  console.log(`Debug flow: detectAmbiguousStyleIntent fired with`, { message, widgetCategory });
  const normalized = message.toLowerCase().replace(/\s+/g, " ").trim();
  const isQuestion = normalized.includes("?");
  const hasDiagnosticLanguage =
    /\b(is|why|can|can't|cannot|not working|broken|issue|problem|error|disabled)\b/.test(normalized);
  const hasDirectStyleVerb =
    /\b(set|make|change|update|adjust|apply|add|remove|increase|decrease|align|justify|center|left|right)\b/.test(normalized);

  if (isQuestion && hasDiagnosticLanguage && !hasDirectStyleVerb) {
    const result = {
      needsClarification: true,
      clarificationQuestion: "Do you want me to change CSS styling, or are you reporting a behavior bug that needs a component/code fix?",
    };
    console.log(`Debug flow: detectAmbiguousStyleIntent result`, result);
    return result;
  }

  const hasHorizontalAlignIntent =
    /\balign\s+(right|left|center|middle)\b/.test(normalized) ||
    ((/\b(align|aligned|alignment|move|position)\b/.test(normalized) || /\b(right|left|center|middle)\b/.test(normalized))
      && /\b(right|left|center|middle)\b/.test(normalized));

  const hasExplicitCssProperty = /justify-content|align-items|text-align|margin-left|margin-right|left:|right:|display:\s*flex|float|position:/.test(normalized);
  const hasTargetDetail = /\b(container|wrapper|column|block|button|content|text|icon|label|title|parent|child|widget)\b/.test(normalized);
  const isShortVagueMessage = normalized.split(" ").length <= 8;

  if (!hasHorizontalAlignIntent || hasExplicitCssProperty) {
    const result = { needsClarification: false };
    console.log(`Debug flow: detectAmbiguousStyleIntent result`, result);
    return result;
  }

  if (!hasTargetDetail || isShortVagueMessage) {
    const clarificationQuestion = widgetCategory === "button"
      ? BUTTON_POSITION_CLARIFICATION
      : "Do you want to move the whole widget/container to the right, or only right-align content inside it?";
    const result = { needsClarification: true, clarificationQuestion };
    console.log(`Debug flow: detectAmbiguousStyleIntent result`, result);
    return result;
  }

  const result = { needsClarification: false };
  console.log(`Debug flow: detectAmbiguousStyleIntent result`, result);
  return result;
}

function getLastAssistantMessage(history: GroqChatMessage[]): string {
  console.log(`Debug flow: getLastAssistantMessage fired with`, { historyLength: history.length });
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const entry = history[index];
    if (entry.role === "assistant") {
      console.log(`Debug flow: getLastAssistantMessage result`, { found: true, index });
      return entry.content;
    }
  }
  console.log(`Debug flow: getLastAssistantMessage result`, { found: false, index: -1 });
  return "";
}

function resolveClarifiedStyleMessage(
  message: string,
  history: GroqChatMessage[],
  widgetCategory?: string
): string {
  console.log(`Debug flow: resolveClarifiedStyleMessage fired with`, {
    message,
    historyLength: history.length,
    widgetCategory,
  });
  const lastAssistantMessage = getLastAssistantMessage(history);
  const normalized = message.toLowerCase().replace(/\s+/g, " ").trim();
  const isResolvingButtonClarification =
    widgetCategory === "button"
      && lastAssistantMessage.toLowerCase().includes(BUTTON_POSITION_CLARIFICATION.toLowerCase());

  if (!isResolvingButtonClarification) {
    console.log(`Debug flow: resolveClarifiedStyleMessage result`, {
      resolvedMessage: message,
      reason: "no-pending-clarification",
    });
    return message;
  }

  const asksForInnerContentAlignment =
    /\b(text|icon|content|label|title|inside|internal)\b/.test(normalized);
  if (asksForInnerContentAlignment) {
    const resolvedMessage = "right-align the text and icon inside the button";
    console.log(`Debug flow: resolveClarifiedStyleMessage result`, { resolvedMessage, reason: "inner-content" });
    return resolvedMessage;
  }

  const confirmsWholeButton =
    /^(yes|yeah|yep|yup|sure|ok|okay|do it|apply it|whole button|move button|move the button|button|right|to the right)$/.test(normalized) ||
    (/\b(move|position|place|put)\b/.test(normalized) && /\b(right|end)\b/.test(normalized));
  if (confirmsWholeButton) {
    const resolvedMessage = "move the whole button to the right side of the container";
    console.log(`Debug flow: resolveClarifiedStyleMessage result`, { resolvedMessage, reason: "whole-button" });
    return resolvedMessage;
  }

  console.log(`Debug flow: resolveClarifiedStyleMessage result`, {
    resolvedMessage: message,
    reason: "unresolved",
  });
  return message;
}

function detectNonStyleContractIntent(
  message: string,
  widget?: WidgetInfo
): ClarificationDecision {
  if (!widget) {
    return { needsClarification: false };
  }

  const normalized = message.toLowerCase().replace(/\s+/g, " ").trim();
  const widgetSpec = getWidgetSpec(widget.widgetId, widget.category, widget.widgetData);
  const asksForIcon = /\bicon\b/.test(normalized);
  const asksForConfig = /\b(config|configure|feature|features|pagination|sorting|filter|columns?|settings?)\b/.test(normalized);
  const asksForData = /\b(label|title|value|values|text|progress|target|current|goal|goals|item|items|row|rows|status|placeholder)\b/.test(normalized);
  const asksForCss = /\b(background|padding|margin|border|shadow|radius|align|justify|display|position|width|height|font|text-align|color)\b/.test(normalized);

  if (asksForIcon || (asksForConfig && !asksForCss)) {
    return {
      needsClarification: true,
      clarificationQuestion: `That request belongs to ${asksForConfig ? "/config" : "/data"}, not /styles. Follow the selected widget contract: ${widgetSpec.configExamples[0] ?? widgetSpec.dataExamples[0] ?? "use the matching command mode"}`,
    };
  }

  if (asksForData && !asksForCss) {
    return {
      needsClarification: true,
      clarificationQuestion: `That request changes widget internals, not wrapper CSS. Use /data based on the selected widget contract: ${widgetSpec.dataExamples[0] ?? "/data update an allowed widget field"}`,
    };
  }

  return { needsClarification: false };
}

export async function POST(request: NextRequest) {
  console.log(`Debug flow: POST /api/builder/ai-style fired`);

  try {
    const body = await request.json();
    const { blockId, slotIdx, blockType, currentCss, message, history, widget, mode, promptContext } = body as {
      blockId: string;
      slotIdx: number;
      blockType: string;
      currentCss: string;
      message: string;
      history: GroqChatMessage[];
	      widget?: WidgetInfo;
      mode?: "styles";
      promptContext?: string;
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json({ ok: false, error: "message is required" }, { status: 400 });
    }

    console.log(`Debug flow: POST /api/builder/ai-style params`, { blockId, slotIdx, blockType, currentCss, widget, hasPromptContext: !!promptContext });
    const resolvedMessage = resolveClarifiedStyleMessage(message, history ?? [], widget?.category);
	    const clarificationDecision = detectAmbiguousStyleIntent(resolvedMessage, widget?.category);
	    if (clarificationDecision.needsClarification) {
      return NextResponse.json({
        ok: true,
        needsClarification: true,
        clarificationQuestion: clarificationDecision.clarificationQuestion,
	      });
	    }
		    const nonStyleDecision = detectNonStyleContractIntent(resolvedMessage, widget);
	    if (nonStyleDecision.needsClarification) {
	      return NextResponse.json({
	        ok: true,
	        needsClarification: true,
	        clarificationQuestion: nonStyleDecision.clarificationQuestion,
	      });
	    }

    const isBlockLevel = slotIdx < 0;
    const targetLabel = isBlockLevel
      ? `block wrapper for block ${blockId}`
      : `column ${slotIdx + 1} of block ${blockId}`;
	    const targetElementId = isBlockLevel
	      ? `builder-block-${blockId}`
	      : `builder-slot-${blockId}-${slotIdx}`;
	    const widgetSpec = !isBlockLevel && widget
	      ? getWidgetSpec(widget.widgetId, widget.category, widget.widgetData)
	      : null;

	    const widgetInfo = !isBlockLevel && widget ? `

WIDGET CONTENT:
This column contains a "${widget.title}" widget (ID: ${widget.widgetId}, Category: ${widget.category}).

WIDGET DATA (all configurable properties):
${JSON.stringify(widget.widgetData, null, 2)}

${widgetSpec ? buildWidgetSpecPrompt(widgetSpec) : ""}

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
- If the selected widget contract says an internal visual change belongs to widget data or config, do not fake it with wrapper CSS.
- If the requested change targets chart colors, progress internals, labels, values, or icons, refuse here and tell the user to use /data or /config based on the contract.` : `

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
${promptContext ? `

SELECTED COLUMN JSX CONTEXT:
${promptContext}
` : ""}

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
6. Remember: You are styling ${targetLabel}. These styles will ONLY affect this specific ${isBlockLevel ? "block wrapper" : "column"}.
7. If the user asks for an internal widget change covered by the selected widget contract, do not guess with CSS. Return a short refusal as CSS cannot perform that change.`;

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: resolvedMessage },
    ];
    console.log(`Debug flow: POST /api/builder/ai-style final prompt`, {
      blockId,
      slotIdx,
      targetElementId,
      isBlockLevel,
      mode: mode ?? null,
      currentCssLength: currentCss.length,
      resolvedMessageLength: resolvedMessage.length,
      resolvedMessage,
      promptContextLength: promptContext?.length ?? 0,
      promptContextPreview: promptContext?.slice(0, 1000) ?? null,
      systemPromptLength: systemPrompt.length,
      systemPrompt,
      historyCount: history.length,
      historyPreview: history.map((entry, index) => ({
        index,
        role: entry.role,
        contentPreview: entry.content.slice(0, 240),
      })),
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.3,
      max_tokens: 256,
    });

    const css = completion.choices[0]?.message?.content?.trim() ?? "";
    const sanitizedCss = sanitizeGeneratedCss(css);
    console.log(`Debug flow: POST /api/builder/ai-style groq response`, {
      css,
      sanitizedCss,
      wasSanitized: css !== sanitizedCss,
    });

    return NextResponse.json({ ok: true, css: sanitizedCss || css });
  } catch (err) {
    console.error(`Debug flow: POST /api/builder/ai-style error`, err);
    return NextResponse.json({ ok: false, error: "AI style generation failed" }, { status: 500 });
  }
}
