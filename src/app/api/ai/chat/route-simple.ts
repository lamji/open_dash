import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/lib/prisma";
import { getProjectContext, isErrorResponse } from "@/lib/project-auth";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const HTML_GENERATOR_PROMPT = `You are an expert HTML/Tailwind CSS code generator.

Generate complete, production-ready HTML code with Tailwind CSS classes based on user requests.

RULES:
1. Generate ONLY the HTML body content (no <!DOCTYPE>, <html>, <head>, or <body> tags)
2. Use Tailwind CSS utility classes for ALL styling
3. Make components responsive with sm:, md:, lg: breakpoints
4. Use semantic HTML elements (div, section, article, header, footer, etc.)
5. Add onclick="alert('...')" for interactive buttons as requested
6. Use Unsplash images: https://images.unsplash.com/photo-[id]?auto=format&fit=crop&w=[width]&q=80
7. Include proper spacing with gap-*, p-*, m-* utilities
8. Use modern color schemes (bg-white, text-gray-800, border-gray-200, etc.)
9. Add hover states (hover:bg-gray-100, hover:shadow-lg, etc.)
10. Return ONLY the HTML code in a markdown code fence with "html" language identifier

EXAMPLE OUTPUT FORMAT:
\`\`\`html
<div class="max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
  <!-- Your HTML here -->
</div>
\`\`\`

Generate clean, modern, accessible HTML with Tailwind CSS.`;

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

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { message: "GROQ_API_KEY not configured", actions: [] },
        { status: 200 }
      );
    }

    // Call Groq AI to generate HTML
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: HTML_GENERATOR_PROMPT,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

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
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : "Internal server error",
        actions: []
      },
      { status: 500 }
    );
  }
}
