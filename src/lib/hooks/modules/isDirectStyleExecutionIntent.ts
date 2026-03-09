import {
  ASSISTANT_INTENT_PREFIXES,
  CONTAINER_LAYOUT_KEYWORDS,
  STYLE_REQUEST_KEYWORDS,
} from "./useBuilderController.constants";

export function isDirectStyleExecutionIntent(messageLower: string): boolean {
  console.log(`Debug flow: isDirectStyleExecutionIntent fired with`, { messageLower });
  const startsAsQuestionOrHelp = ASSISTANT_INTENT_PREFIXES.some((prefix) => messageLower.startsWith(prefix));
  const hasQuestionMark = messageLower.includes("?");
  const hasActionVerb = /\b(move|align|justify|center|place|put|set|make|change|update|add|remove|stretch)\b/.test(messageLower);
  const hasLayoutTarget =
    STYLE_REQUEST_KEYWORDS.some((keyword) => messageLower.includes(keyword)) ||
    CONTAINER_LAYOUT_KEYWORDS.some((keyword) => messageLower.includes(keyword)) ||
    /\b(right|left|top|bottom|middle|end|start)\b/.test(messageLower);
  const result = !startsAsQuestionOrHelp && !hasQuestionMark && hasActionVerb && hasLayoutTarget;
  console.log(`Debug flow: isDirectStyleExecutionIntent result`, {
    startsAsQuestionOrHelp,
    hasQuestionMark,
    hasActionVerb,
    hasLayoutTarget,
    result,
  });
  return result;
}
