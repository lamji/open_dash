import {
  CSS_PROPERTY_ALIASES,
  FLEX_LAYOUT_PROPS,
  NON_FLEX_DISPLAY_VALUES,
} from "./useBuilderController.constants";
import { isCssDeclarationValid } from "./isCssDeclarationValid";

export function normalizeCssDeclarations(css: string): string {
  console.log(`Debug flow: normalizeCssDeclarations fired with`, { cssLength: css.length });
  if (!css.trim()) {
    return "";
  }
  const normalized = css
    .replace(/,\s*\n\s*/g, "; ")
    .replace(/\n\s*/g, "; ")
    .replace(/\r/g, "");
  const declarations = new Map<string, string>();
  normalized.split(";").forEach((decl) => {
    const colonIdx = decl.indexOf(":");
    if (colonIdx === -1) return;
    const rawProp = decl.slice(0, colonIdx).trim().toLowerCase();
    const val = decl.slice(colonIdx + 1).trim();
    if (!rawProp || !val) return;
    const prop = CSS_PROPERTY_ALIASES[rawProp] ?? rawProp;
    if (!isCssDeclarationValid(prop, val)) {
      return;
    }
    declarations.set(prop, val);
  });
  const hasFlexLayoutProp = Array.from(declarations.keys()).some((prop) => FLEX_LAYOUT_PROPS.has(prop));
  const displayValue = declarations.get("display")?.toLowerCase();
  if (hasFlexLayoutProp && (!displayValue || NON_FLEX_DISPLAY_VALUES.has(displayValue))) {
    declarations.set("display", "flex");
  }
  const result = Array.from(declarations.entries())
    .map(([prop, val]) => `${prop}: ${val}`)
    .join("; ");
  console.log(`Debug flow: normalizeCssDeclarations result`, {
    declarationCount: declarations.size,
    resultLength: result.length,
  });
  return result;
}
