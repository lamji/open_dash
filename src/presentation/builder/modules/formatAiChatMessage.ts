"use client";

function escapeHtml(value: string): string {
  console.log("Debug flow: escapeHtml fired", { valueLength: value.length });
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatInlineCode(value: string): string {
  console.log("Debug flow: formatInlineCode fired", { valueLength: value.length });
  return value.replace(/`([^`]+)`/g, "<code>$1</code>");
}

function formatSlashCommands(value: string): string {
  console.log("Debug flow: formatSlashCommands fired", { valueLength: value.length });
  return value.replace(/(^|\s)(\/[a-z][\w-]*)/gi, '$1<code>$2</code>');
}

function formatAssistantLine(line: string): string {
  console.log("Debug flow: formatAssistantLine fired", { lineLength: line.length });
  return formatSlashCommands(formatInlineCode(escapeHtml(line.trim())));
}

function buildCommaListItems(value: string): string[] {
  console.log("Debug flow: buildCommaListItems fired", { valueLength: value.length });
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatAiChatMessage(content: string): string {
  console.log("Debug flow: formatAiChatMessage fired", { contentLength: content.length });
  const normalized = content.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return "<p></p>";
  }

  const sections = normalized
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(Boolean);

  const htmlSections = sections.map((section) => {
    const lines = section
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 1) {
      const [singleLine] = lines;
      const colonMatch = singleLine.match(/^([^:]{3,60}):\s*(.+)$/);
      if (colonMatch) {
        const title = formatAssistantLine(colonMatch[1] ?? "");
        const detail = colonMatch[2] ?? "";
        const items = buildCommaListItems(detail);
        if (items.length >= 3) {
          return `<section><p><strong>${title}:</strong></p><ul>${items
            .map((item) => `<li>${formatAssistantLine(item)}</li>`)
            .join("")}</ul></section>`;
        }
        return `<section><p><strong>${title}:</strong> ${formatAssistantLine(detail)}</p></section>`;
      }
      return `<p>${formatAssistantLine(singleLine)}</p>`;
    }

    const maybeListItems = lines.filter((line) => /^[-*]\s+/.test(line));
    if (maybeListItems.length === lines.length) {
      return `<ul>${maybeListItems
        .map((line) => `<li>${formatAssistantLine(line.replace(/^[-*]\s+/, ""))}</li>`)
        .join("")}</ul>`;
    }

    const [headingLine, ...bodyLines] = lines;
    const headingMatch = headingLine.match(/^([^:]{3,60}):\s*(.*)$/);
    if (headingMatch) {
      const heading = formatAssistantLine(headingMatch[1] ?? "");
      const firstBody = headingMatch[2]?.trim() ?? "";
      const allBodyLines = [firstBody, ...bodyLines].filter(Boolean);
      const commaItems = allBodyLines.length === 1 ? buildCommaListItems(allBodyLines[0] ?? "") : [];
      if (commaItems.length >= 3) {
        return `<section><p><strong>${heading}:</strong></p><ul>${commaItems
          .map((item) => `<li>${formatAssistantLine(item)}</li>`)
          .join("")}</ul></section>`;
      }
      return `<section><p><strong>${heading}:</strong></p>${allBodyLines
        .map((line) => `<p>${formatAssistantLine(line)}</p>`)
        .join("")}</section>`;
    }

    return `<section>${lines.map((line) => `<p>${formatAssistantLine(line)}</p>`).join("")}</section>`;
  });

  return htmlSections.join("");
}
