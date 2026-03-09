import { normalizeCssDeclarations } from "./normalizeCssDeclarations";

export function mergeCss(existing: string, incoming: string): string {
  console.log(`Debug flow: mergeCss fired with`, { existingLen: existing.length, incomingLen: incoming.length });
  const normalizedExisting = normalizeCssDeclarations(existing);
  const normalizedIncoming = normalizeCssDeclarations(incoming);
  const toMap = (css: string): Map<string, string> => {
    const map = new Map<string, string>();
    css.split(";").forEach((decl) => {
      const colonIdx = decl.indexOf(":");
      if (colonIdx === -1) return;
      const prop = decl.slice(0, colonIdx).trim();
      const val = decl.slice(colonIdx + 1).trim();
      if (prop) map.set(prop, val);
    });
    return map;
  };
  const merged = new Map([...toMap(normalizedExisting), ...toMap(normalizedIncoming)]);
  const mergedCss = Array.from(merged.entries())
    .filter(([, v]) => v && v.trim())
    .map(([p, v]) => `${p}: ${v}`)
    .join("; ");
  const result = normalizeCssDeclarations(mergedCss);
  console.log(`Debug flow: mergeCss result`, { resultLen: result.length });
  return result;
}
