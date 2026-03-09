export function extractExplicitReplacementValue(message: string): string | null {
  console.log(`Debug flow: extractExplicitReplacementValue fired with`, { message });
  const quotedValueMatch = message.match(/["']([^"']+)["']\s*$/);
  if (quotedValueMatch) {
    return quotedValueMatch[1]?.trim() ?? null;
  }

  const delimiterMatch = message.match(/\b(?:to|into|as)\b\s+(.+)$/i);
  if (!delimiterMatch) {
    return null;
  }
  const nextValue = delimiterMatch[1]?.trim() ?? "";
  return nextValue.length > 0 ? nextValue : null;
}
