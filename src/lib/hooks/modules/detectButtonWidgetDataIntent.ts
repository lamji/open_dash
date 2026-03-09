import {
  BUTTON_INNER_STYLE_KEYWORDS,
  CONTAINER_LAYOUT_KEYWORDS,
} from "./useBuilderController.constants";

export function detectButtonWidgetDataIntent(messageLower: string): boolean {
  console.log(`Debug flow: detectButtonWidgetDataIntent fired with`, { messageLower });
  const hasButtonInnerKeyword = BUTTON_INNER_STYLE_KEYWORDS.some((keyword) => messageLower.includes(keyword));
  const hasLayoutKeyword = CONTAINER_LAYOUT_KEYWORDS.some((keyword) => messageLower.includes(keyword))
    || /\b(move|position|right|left|middle|top|bottom|side)\b/.test(messageLower);
  const result = hasButtonInnerKeyword && !hasLayoutKeyword;
  console.log(`Debug flow: detectButtonWidgetDataIntent result`, {
    hasButtonInnerKeyword,
    hasLayoutKeyword,
    result,
  });
  return result;
}
