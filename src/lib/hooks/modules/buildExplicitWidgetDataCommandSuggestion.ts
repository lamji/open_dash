import type { GroqStyleContext } from "@/domain/builder/types";
import { collectWidgetFieldEntries } from "./useBuilderController.field-utils";
import { buildExplicitIconCommandSuggestion } from "./buildExplicitIconCommandSuggestion";
import { extractExplicitReplacementValue } from "./extractExplicitReplacementValue";
import { extractRequestedLucideIconName } from "./extractRequestedLucideIconName";
import { resolveRepeatedWidgetFieldPath } from "./resolveRepeatedWidgetFieldPath";

export function buildExplicitWidgetDataCommandSuggestion(
  context: GroqStyleContext | null,
  message: string
): string | null {
  console.log(`Debug flow: buildExplicitWidgetDataCommandSuggestion fired with`, {
    hasContext: !!context,
    hasWidget: !!context?.widget,
    message,
  });
  if (!context?.widget) {
    return null;
  }

  const messageLower = message.toLowerCase();
  const targetWidget = context.promptContextSnapshot?.targetWidget;
  const availableIcons =
    targetWidget?.iconCandidates ?? context.promptContextSnapshot?.availableLucideIcons ?? [];
  const explicitIconCommand = buildExplicitIconCommandSuggestion(context, message);
  if (explicitIconCommand) {
    return explicitIconCommand;
  }

  const allowedFieldPaths = [
    ...(targetWidget?.widgetDataPaths ?? []),
    ...(targetWidget?.iconFieldPaths ?? []),
  ];
  const fieldEntries = collectWidgetFieldEntries(context.widget.widgetData).filter((entry) => {
    if (allowedFieldPaths.length === 0) {
      return true;
    }
    return allowedFieldPaths.some((fieldPath) => {
      const normalizedFieldPath = fieldPath.replace(/\[\]/g, "");
      return entry.path.startsWith(normalizedFieldPath);
    });
  });
  const targetPath = resolveRepeatedWidgetFieldPath(messageLower, fieldEntries);
  if (!targetPath) {
    return null;
  }

  const nextValue = /icon/i.test(targetPath)
    ? extractRequestedLucideIconName(message, availableIcons)
    : extractExplicitReplacementValue(message);
  if (!nextValue) {
    return null;
  }

  const command = `/data set ${targetPath} to ${nextValue}`;
  console.log(`Debug flow: buildExplicitWidgetDataCommandSuggestion result`, { command });
  return command;
}
