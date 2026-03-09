import type { IconFieldEntry, WidgetFieldEntry } from "@/domain/builder/types";

export const ICON_REFERENCE_PATTERNS = [
  { pattern: /\b(first|1st|top|leading)\b/, index: 0 },
  { pattern: /\b(second|2nd)\b/, index: 1 },
  { pattern: /\b(third|3rd)\b/, index: 2 },
  { pattern: /\b(fourth|4th)\b/, index: 3 },
] as const;

export function collectIconFieldEntries(value: unknown, basePath = ""): IconFieldEntry[] {
  console.log(`Debug flow: collectIconFieldEntries fired with`, {
    basePath,
    valueType: Array.isArray(value) ? "array" : typeof value,
  });
  if (value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      collectIconFieldEntries(entry, `${basePath}[${index}]`)
    );
  }
  if (typeof value !== "object") {
    return [];
  }

  const entries: IconFieldEntry[] = [];
  Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
    const path = basePath ? `${basePath}.${key}` : key;
    if (/icon/i.test(key) && typeof child === "string") {
      entries.push({ path, value: child });
    }
    entries.push(...collectIconFieldEntries(child, path));
  });
  return entries;
}

export function normalizeAssistantToken(value: string): string {
  console.log(`Debug flow: normalizeAssistantToken fired with`, { value });
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function collectWidgetFieldEntries(value: unknown, basePath = ""): WidgetFieldEntry[] {
  console.log(`Debug flow: collectWidgetFieldEntries fired with`, {
    basePath,
    valueType: Array.isArray(value) ? "array" : typeof value,
  });
  if (value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      collectWidgetFieldEntries(entry, `${basePath}[${index}]`)
    );
  }
  if (typeof value !== "object") {
    if (
      basePath &&
      (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    ) {
      return [{ path: basePath, value }];
    }
    return [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    const path = basePath ? `${basePath}.${key}` : key;
    return collectWidgetFieldEntries(child, path);
  });
}

export function resolveOrdinalReferenceIndex(messageLower: string, fieldCount: number): number | null {
  console.log(`Debug flow: resolveOrdinalReferenceIndex fired with`, { messageLower, fieldCount });
  for (const { pattern, index } of ICON_REFERENCE_PATTERNS) {
    if (pattern.test(messageLower)) {
      return index < fieldCount ? index : null;
    }
  }

  const itemNumberMatch = messageLower.match(/\b(?:item|entry|row|card|icon|label|value)\s+(\d+)\b/);
  if (itemNumberMatch) {
    const requestedIndex = Number(itemNumberMatch[1]) - 1;
    return requestedIndex >= 0 && requestedIndex < fieldCount ? requestedIndex : null;
  }

  if (/\b(last|final)\b/.test(messageLower)) {
    return fieldCount > 0 ? fieldCount - 1 : null;
  }

  return null;
}

export function extractFieldNameTokens(messageLower: string): string[] {
  console.log(`Debug flow: extractFieldNameTokens fired with`, { messageLower });
  const matches = messageLower.match(/\b[a-z][a-z0-9]*\b/g) ?? [];
  return matches.filter((token) =>
    ![
      "change",
      "set",
      "update",
      "edit",
      "make",
      "turn",
      "first",
      "second",
      "third",
      "fourth",
      "last",
      "final",
      "to",
      "the",
      "this",
      "that",
      "widget",
      "item",
      "entry",
      "row",
      "card",
    ].includes(token)
  );
}

export function groupRepeatedFieldEntries(fieldEntries: WidgetFieldEntry[]): WidgetFieldEntry[][] {
  console.log(`Debug flow: groupRepeatedFieldEntries fired with`, { fieldCount: fieldEntries.length });
  const groups = new Map<string, WidgetFieldEntry[]>();
  fieldEntries.forEach((entry) => {
    const templatePath = entry.path.replace(/\[\d+\]/g, "[]");
    const group = groups.get(templatePath) ?? [];
    group.push(entry);
    groups.set(templatePath, group);
  });
  return [...groups.values()]
    .filter((group) => group.length > 1)
    .sort((left, right) => left[0]!.path.localeCompare(right[0]!.path));
}
