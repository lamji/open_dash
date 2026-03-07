import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import * as LucideIcons from "lucide-react";
import type { GroqChatMessage } from "@/domain/builder/types";
import {
  buildWidgetSpecPrompt,
  getWidgetSpec,
  validateWidgetDataAgainstSpec,
} from "@/lib/widget-spec-registry";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
	    const widgetSpec = getWidgetSpec(widgetId, category, currentWidgetData);
	    const enforcementMode = mode === "config" ? "config" : "data";

	    const systemPrompt = `You are updating EXISTING widget data for OpenDash Builder.
Return ONLY valid JSON — NO markdown, NO code fences, NO explanations.

${buildWidgetSpecPrompt(widgetSpec)}

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
3. Match the selected widget contract exactly
4. Use realistic values for any new data points
5. Never introduce new root fields outside the selected widget contract
6. In DATA mode, update only data/icon fields allowed by the contract
7. In CONFIG mode, update only config/settings fields allowed by the contract
8. For button icon updates, use ONLY valid Lucide icon names in PascalCase. Never invent icon names.`;

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

	    const validation = validateWidgetDataAgainstSpec(currentWidgetData, updatedWidgetData, widgetSpec, enforcementMode);
	    if (!validation.ok) {
	      console.warn(`Debug flow: POST /api/builder/ai-widget-update contract validation failed`, {
	        widgetId,
	        mode: enforcementMode,
	        invalidPaths: validation.invalidPaths,
	      });
	      return NextResponse.json(
	        {
	          ok: false,
	          error: `AI proposed fields outside the selected widget contract: ${validation.invalidPaths.join(", ")}`,
	        },
	        { status: 400 }
	      );
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
