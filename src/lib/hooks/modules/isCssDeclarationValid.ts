export function isCssDeclarationValid(prop: string, val: string): boolean {
  console.log(`Debug flow: isCssDeclarationValid fired with`, { prop, val });
  if (typeof document === "undefined") {
    return true;
  }
  if (prop.startsWith("--")) {
    return true;
  }
  const style = document.createElement("div").style;
  style.setProperty(prop, "");
  style.setProperty(prop, val);
  const appliedValue = style.getPropertyValue(prop).trim();
  const result = appliedValue.length > 0;
  console.log(`Debug flow: isCssDeclarationValid result`, { prop, result, appliedValue });
  return result;
}
