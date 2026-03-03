import { notFound } from "next/navigation";
import { readFileSync } from "fs";
import { join } from "path";
import React from "react";

// Convert Markdown to HTML (basic implementation)
function markdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, "<h3 class='text-xl font-semibold mt-6 mb-3'>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2 class='text-2xl font-bold mt-8 mb-4'>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1 class='text-3xl font-bold mt-8 mb-6'>$1</h1>")
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' class='text-blue-600 hover:underline'>$1</a>")
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre class='bg-gray-100 p-4 rounded-lg overflow-x-auto my-4'><code>$2</code></pre>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code class='bg-gray-100 px-1 py-0.5 rounded text-sm'>$1</code>")
    // Lists
    .replace(/^\* (.+)$/gim, "<li class='ml-4'>$1</li>")
    .replace(/(<li[\s\S]*?<\/li>)/g, "<ul class='list-disc list-inside my-2'>$1</ul>")
    // Tables
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split("|").filter(cell => cell.trim());
      const cellTags = cells.map(cell => `<td class='border px-4 py-2'>${cell.trim()}</td>`).join("");
      return `<tr>${cellTags}</tr>`;
    })
    .replace(/(<tr[\s\S]*?<\/tr>)/g, "<table class='w-full border-collapse my-4'>$1</table>")
    // Line breaks
    .replace(/\n\n/g, "</p><p class='my-4'>")
    .replace(/\n/g, "<br />")
    // Wrap in paragraphs
    .replace(/^(?!(<h|<ul|<table|<pre|<p))(.+)$/gm, "<p class='my-4'>$2</p>");
}

export default function HowToPage() {
  try {
    // Read the markdown file
    const filePath = join(process.cwd(), "how-to.md");
    const markdown = readFileSync(filePath, "utf-8");
    
    // Convert to HTML
    const htmlContent = markdownToHtml(markdown);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <a 
              href="/" 
              className="text-blue-600 hover:underline mb-4 inline-block"
            >
              ← Back to Home
            </a>
          </div>
          
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error reading how-to.md:", error);
    notFound();
  }
}
