export function mapAssistantResponseTypeToMode(
  responseType?: "answer" | "execute_styles" | "execute_data" | "execute_config" | "clarify"
): "styles" | "data" | "config" | null {
  console.log(`Debug flow: mapAssistantResponseTypeToMode fired with`, { responseType });
  if (responseType === "execute_styles") {
    return "styles";
  }
  if (responseType === "execute_data") {
    return "data";
  }
  if (responseType === "execute_config") {
    return "config";
  }
  return null;
}
