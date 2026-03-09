import type { IconFieldEntry } from "@/domain/builder/types";
import { ICON_REFERENCE_PATTERNS } from "./useBuilderController.field-utils";

export function resolveIconFieldPath(
  messageLower: string,
  iconFields: IconFieldEntry[]
): string | null {
  console.log(`Debug flow: resolveIconFieldPath fired with`, {
    messageLower,
    iconFieldCount: iconFields.length,
  });
  if (iconFields.length === 0) {
    return null;
  }
  if (iconFields.length === 1) {
    return iconFields[0]?.path ?? null;
  }

  if (/\bheader\b/.test(messageLower)) {
    const headerField = iconFields.find((entry) => entry.path.toLowerCase().includes("header"));
    if (headerField) {
      return headerField.path;
    }
  }

  for (const { pattern, index } of ICON_REFERENCE_PATTERNS) {
    if (pattern.test(messageLower) && iconFields[index]) {
      return iconFields[index].path;
    }
  }

  const iconNumberMatch = messageLower.match(/\bicon\s+(\d+)\b/);
  if (iconNumberMatch) {
    const requestedIndex = Number(iconNumberMatch[1]) - 1;
    if (requestedIndex >= 0 && iconFields[requestedIndex]) {
      return iconFields[requestedIndex].path;
    }
  }

  if (/\b(last|final)\b/.test(messageLower)) {
    return iconFields[iconFields.length - 1]?.path ?? null;
  }

  return null;
}
