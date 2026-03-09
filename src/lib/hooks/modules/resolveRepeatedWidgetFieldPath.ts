import type { WidgetFieldEntry } from "@/domain/builder/types";
import {
  extractFieldNameTokens,
  groupRepeatedFieldEntries,
  normalizeAssistantToken,
  resolveOrdinalReferenceIndex,
} from "./useBuilderController.field-utils";

export function resolveRepeatedWidgetFieldPath(
  messageLower: string,
  fieldEntries: WidgetFieldEntry[]
): string | null {
  console.log(`Debug flow: resolveRepeatedWidgetFieldPath fired with`, {
    messageLower,
    fieldCount: fieldEntries.length,
  });
  const groupedEntries = groupRepeatedFieldEntries(fieldEntries);
  if (groupedEntries.length === 0) {
    return null;
  }

  const fieldTokens = extractFieldNameTokens(messageLower);
  const matchingGroups = groupedEntries.filter((group) => {
    const lastSegment = group[0]?.path.split(".").pop()?.replace(/\[\d+\]/g, "") ?? "";
    const normalizedSegment = normalizeAssistantToken(lastSegment);
    return fieldTokens.some((token) => normalizedSegment.includes(normalizeAssistantToken(token)));
  });
  const candidateGroups = matchingGroups.length > 0 ? matchingGroups : groupedEntries;
  const ordinalIndex = resolveOrdinalReferenceIndex(messageLower, candidateGroups[0]?.length ?? 0);
  if (ordinalIndex === null) {
    return null;
  }

  if (candidateGroups.length === 1) {
    return candidateGroups[0]?.[ordinalIndex]?.path ?? null;
  }

  if (/\bheader\b/.test(messageLower)) {
    const headerGroup = candidateGroups.find((group) =>
      group[0]?.path.toLowerCase().includes("header")
    );
    if (headerGroup) {
      return headerGroup[ordinalIndex]?.path ?? null;
    }
  }

  return candidateGroups[0]?.[ordinalIndex]?.path ?? null;
}
