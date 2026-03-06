import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { GroqChatMessage } from "@/domain/builder/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface BuilderAssistantRequest {
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
  promptContext?: string;
}

interface BuilderAssistantResponse {
  ok: boolean;
  reply?: string;
  responseType?: "answer" | "execute_styles" | "execute_data" | "execute_config" | "clarify";
  recommendedMode?: "styles" | "data" | "config" | "none";
  error?: string;
}

function getDisabledStatusReply(
  messageLower: string,
  widget?: {
    widgetId: string;
    category: string;
    title: string;
    widgetData: Record<string, unknown>;
  }
): string | null {
  console.log(`Debug flow: getDisabledStatusReply fired with`, {
    messageLower,
    hasWidget: !!widget,
  });
  if (!messageLower.includes("disabled")) {
    console.log(`Debug flow: getDisabledStatusReply result`, { matched: false });
    return null;
  }

  if (!widget) {
    const reply = "I can't check disabled state because this column has no widget selected. Select a widget first, then ask again.";
    console.log(`Debug flow: getDisabledStatusReply result`, { matched: true, reply });
    return reply;
  }

  const disabledValue = widget.widgetData.disabled;
  if (typeof disabledValue === "boolean") {
    const reply = disabledValue
      ? `Yes. "${widget.title}" is currently disabled (widgetData.disabled = true). You can enable it with \`/data set disabled to false\`.`
      : `No. "${widget.title}" is not disabled (widgetData.disabled = false).`;
    console.log(`Debug flow: getDisabledStatusReply result`, { matched: true, reply });
    return reply;
  }

  const reply = `I don't see a \`disabled\` field on "${widget.title}" right now. If you want it controlled, use \`/data\` to add a boolean \`disabled\` field.`;
  console.log(`Debug flow: getDisabledStatusReply result`, { matched: true, reply });
  return reply;
}

export async function POST(request: NextRequest): Promise<NextResponse<BuilderAssistantResponse>> {
  console.log(`Debug flow: POST /api/builder/ai-assistant fired`);
  try {
    const body = await request.json() as BuilderAssistantRequest;
    const {
      blockId,
      slotIdx,
      blockType,
      currentCss,
      message,
      history,
      widget,
      promptContext,
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ ok: false, error: "message is required" }, { status: 400 });
    }

    const messageLower = message.toLowerCase().trim();
    console.log(`Debug flow: POST /api/builder/ai-assistant params`, {
      blockId,
      slotIdx,
      blockType,
      hasWidget: !!widget,
      hasPromptContext: !!promptContext,
    });

    const deterministicReply = getDisabledStatusReply(messageLower, widget);
    if (deterministicReply) {
      return NextResponse.json({
        ok: true,
        reply: deterministicReply,
        responseType: "answer",
        recommendedMode: "none",
      });
    }

    const scopeLabel = slotIdx < 0
      ? `block wrapper of block ${blockId}`
      : `column ${slotIdx + 1} of block ${blockId}`;

    const systemPrompt = `You are OpenDash Builder Assistant.

You help users with:
- CSS styling questions (use /styles)
- Widget data/content questions (use /data)
- Widget/table configuration questions (use /config)
- General "how do I..." guidance inside this builder

Rules:
1. Answer in plain, concise English.
2. Use the provided context as the source of truth.
3. If user asks "how", "why", "is", or "can", explain what is happening and what to do next.
4. When relevant, include an exact command the user can paste, prefixed with /styles, /data, or /config.
5. Never invent widget fields that are not shown in current widgetData/context.
6. If context is insufficient, ask one short follow-up question.
7. Decide responseType:
   - "execute_styles": direct command to change CSS/layout/positioning
   - "execute_data": direct command to change widget content/data fields
   - "execute_config": direct command to change widget/table configuration
   - "answer": user asks how/why/is/can or wants explanation only
   - "clarify": request is ambiguous and needs one follow-up question
8. Respond as JSON object with:
   - "reply": string
   - "responseType": one of "answer" | "execute_styles" | "execute_data" | "execute_config" | "clarify"
   - "recommendedMode": one of "styles" | "data" | "config" | "none"`;

    const userContext = `TARGET CONTEXT
- Block type: ${blockType}
- Target scope: ${scopeLabel}
- Current CSS: ${currentCss || "(none)"}
- Current widget: ${widget ? `${widget.title} (${widget.widgetId}, ${widget.category})` : "none"}
- Current widgetData: ${widget ? JSON.stringify(widget.widgetData, null, 2) : "(none)"}

${promptContext ? `LIVE BUILDER CONTEXT SNAPSHOT\n${promptContext}\n` : ""}

USER QUESTION
${message}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: userContext },
      ],
      temperature: 0.2,
      max_tokens: 700,
      response_format: { type: "json_object" },
    });

    const payload = completion.choices[0]?.message?.content?.trim() ?? "";
    console.log(`Debug flow: POST /api/builder/ai-assistant raw response`, { payloadLength: payload.length });
    if (!payload) {
      return NextResponse.json({ ok: false, error: "AI generated empty response" }, { status: 500 });
    }

    const parsed = JSON.parse(payload) as {
      reply?: string;
      responseType?: "answer" | "execute_styles" | "execute_data" | "execute_config" | "clarify";
      recommendedMode?: "styles" | "data" | "config" | "none";
    };
    const reply = parsed.reply?.trim();
    const responseType = parsed.responseType ?? "answer";
    const recommendedMode = parsed.recommendedMode ?? "none";

    if (!reply) {
      return NextResponse.json({ ok: false, error: "AI response missing reply" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reply, responseType, recommendedMode });
  } catch (err) {
    console.error(`Debug flow: POST /api/builder/ai-assistant error`, err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
