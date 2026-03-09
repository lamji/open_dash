import { ASSISTANT_INTENT_PREFIXES } from "./useBuilderController.constants";

export function detectAssistantIntent(messageLower: string): boolean {
  console.log(`Debug flow: detectAssistantIntent fired with`, { messageLower });
  const hasQuestionMark = messageLower.includes("?");
  const hasPrefix = ASSISTANT_INTENT_PREFIXES.some((prefix) => messageLower.startsWith(prefix));
  const hasHelpLanguage =
    messageLower.includes("how to") ||
    messageLower.includes("how can") ||
    messageLower.includes("not sure") ||
    messageLower.includes("don't know") ||
    messageLower.includes("dont know") ||
    messageLower.includes("what should i");
  const result = hasQuestionMark || hasPrefix || hasHelpLanguage;
  console.log(`Debug flow: detectAssistantIntent result`, { hasQuestionMark, hasPrefix, hasHelpLanguage, result });
  return result;
}
