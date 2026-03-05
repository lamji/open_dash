import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";
import { getProjectContext, isErrorResponse } from "@/lib/project-auth";
import { HTML_GENERATOR_PROMPT } from "@/lib/aiKnowledgeBase";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  console.log(`Debug flow: POST /api/ai/chat fired with`, { timestamp: new Date().toISOString() });

  try {
    const authResult = await getProjectContext(req);
    if (isErrorResponse(authResult)) {
      return authResult;
    }

    const { projectId } = authResult;
    const body = await req.json();
    const { message } = body;

    console.log(`Debug flow: HTML generation request`, { projectId, message });

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Handle "clear" command explicitly - delete HTML content from database
    const messageLower = message.toLowerCase().trim();
    if (messageLower === "clear" || messageLower === "clear page" || messageLower === "clear all") {
      console.log(`Debug flow: Clear command detected`, { projectId, message });
      
      try {
        const existing = await prisma.appConfig.findFirst({
          where: { key: "page_html_content", projectId },
        });

        if (existing) {
          await prisma.appConfig.delete({
            where: { id: existing.id },
          });
          console.log(`Debug flow: HTML content deleted from database`, { configId: existing.id });
        }

        // Save chat messages
        await prisma.chatMessage.create({
          data: { role: "user", content: message, projectId },
        });
        await prisma.chatMessage.create({
          data: {
            role: "assistant",
            content: "Cleared! All HTML content has been removed from the page.",
            projectId,
          },
        });

        return NextResponse.json({
          message: "Cleared! All HTML content has been removed from the page.",
          actions: [],
          htmlStored: false,
        });
      } catch (clearError) {
        console.error("Clear command error:", clearError);
        return NextResponse.json({
          message: clearError instanceof Error ? clearError.message : "Failed to clear page. Please try again.",
          actions: [],
        }, { status: 500 });
      }
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { message: "GROQ_API_KEY not configured", actions: [] },
        { status: 200 }
      );
    }

    // Load conversation history for context awareness (last 6 messages to prevent token overflow)
    const chatHistory = await prisma.chatMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 6, // Last 6 messages (3 exchanges) for context
    });

    // Reverse to get chronological order
    chatHistory.reverse();

    // Build messages array with conversation context
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      {
        role: "system",
        content: HTML_GENERATOR_PROMPT,
      },
    ];

    // Add conversation history (truncate long messages to prevent token overflow)
    chatHistory.forEach((msg) => {
      if (msg.role === "user" || msg.role === "assistant") {
        const truncatedContent = msg.content.length > 1000 
          ? msg.content.substring(0, 1000) + "..." 
          : msg.content;
        messages.push({
          role: msg.role as "user" | "assistant",
          content: truncatedContent,
        });
      }
    });

    // Check if message contains a widget ID and fetch widget JSX if found
    let widgetContext = "";
    const widgetIdMatch = message.match(/\b(revenue-kpi|user-growth|conversion-rate|sales-target|revenue-chart|activity-chart|traffic-pie|heatmap|activity-feed|top-products|team-performance|goal-tracker|system-health|timeline|comparison|revenue-target|realtime-users|sparkline|satisfaction|weekly-summary)\b/i);
    
    if (widgetIdMatch) {
      const widgetSlug = widgetIdMatch[1].toLowerCase();
      console.log(`Debug flow: Widget ID detected in message`, { widgetSlug });
      
      try {
        const widget = await prisma.widgetTemplate.findUnique({
          where: { slug: widgetSlug },
        });
        
        if (widget) {
          widgetContext = `\n\nWIDGET TEMPLATE CONTEXT:\nThe user referenced widget "${widget.title}" (ID: ${widget.slug}).\nHere is the exact JSX code for this widget:\n\n${widget.jsxCode}\n\nYou can use this as a reference or starting point for the user's request.`;
          console.log(`Debug flow: Widget template loaded`, { slug: widget.slug, title: widget.title });
        }
      } catch (widgetError) {
        console.error('Debug flow: Error fetching widget template', widgetError);
      }
    }

    // Add current user message with widget context if available
    messages.push({
      role: "user",
      content: message + widgetContext,
    });

    console.log(`Debug flow: Groq context`, { 
      historyMessages: chatHistory.length,
      totalMessages: messages.length,
      hasWidgetContext: widgetContext.length > 0
    });

    // Call Groq AI to generate HTML with conversation context
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      });
    } catch (groqError) {
      console.error("Groq API error:", groqError);
      throw new Error(`Groq API failed: ${groqError instanceof Error ? groqError.message : String(groqError)}`);
    }

    const generatedResponse = completion.choices[0]?.message?.content || "";
    console.log(`Debug flow: HTML generated`, { 
      responseLength: generatedResponse.length,
      hasCodeFence: generatedResponse.includes("```")
    });

    // Extract HTML from code fence
    const htmlMatch = generatedResponse.match(/```html\n([\s\S]*?)\n```/);
    const htmlContent = htmlMatch && htmlMatch[1] ? htmlMatch[1].trim() : null;

    if (htmlContent) {
      // Store HTML in AppConfig with key "page_html_content"
      const existing = await prisma.appConfig.findFirst({
        where: { key: "page_html_content", projectId },
      });

      if (existing) {
        await prisma.appConfig.update({
          where: { id: existing.id },
          data: { value: htmlContent },
        });
      } else {
        await prisma.appConfig.create({
          data: {
            key: "page_html_content",
            value: htmlContent,
            projectId,
          },
        });
      }

      console.log(`Debug flow: HTML stored in database`, { htmlLength: htmlContent.length });
    }

    // Save chat messages
    await prisma.chatMessage.create({
      data: { role: "user", content: message, projectId },
    });
    await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content: generatedResponse,
        projectId,
      },
    });

    return NextResponse.json({
      message: generatedResponse,
      actions: [],
      htmlStored: !!htmlContent,
    });

  } catch (error) {
    console.error("HTML generation error:", error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error("Non-Error object thrown:", {
        type: typeof error,
        value: error,
        stringified: JSON.stringify(error, null, 2),
      });
    }
    
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : "Internal server error",
        actions: [],
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
        } : { type: typeof error, value: String(error) }
      },
      { status: 500 }
    );
  }
}
