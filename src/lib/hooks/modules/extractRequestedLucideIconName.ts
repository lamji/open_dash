import { normalizeAssistantToken } from "./useBuilderController.field-utils";

export function extractRequestedLucideIconName(
  message: string,
  availableIcons: string[]
): string | null {
  console.log(`Debug flow: extractRequestedLucideIconName fired with`, {
    message,
    availableIconCount: availableIcons.length,
  });
  const normalizedMessage = normalizeAssistantToken(message);
  const matchingIcon = [...availableIcons]
    .sort((left, right) => right.length - left.length)
    .find((iconName) => normalizedMessage.includes(normalizeAssistantToken(iconName)));
  console.log(`Debug flow: extractRequestedLucideIconName result`, { matchingIcon });
  return matchingIcon ?? null;
}
