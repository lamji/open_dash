import type { GroqStyleContext } from "@/domain/builder/types";
import { collectIconFieldEntries } from "./useBuilderController.field-utils";
import { extractRequestedLucideIconName } from "./extractRequestedLucideIconName";
import { resolveIconFieldPath } from "./resolveIconFieldPath";

export function buildExplicitIconCommandSuggestion(
  context: GroqStyleContext | null,
  message: string
): string | null {
  console.log(`Debug flow: buildExplicitIconCommandSuggestion fired with`, {
    hasContext: !!context,
    hasWidget: !!context?.widget,
    message,
  });
  if (!context?.widget) {
    return null;
  }

  const messageLower = message.toLowerCase();
  if (!messageLower.includes("icon")) {
    return null;
  }

  const targetWidget = context.promptContextSnapshot?.targetWidget;
  const availableIcons =
    targetWidget?.iconCandidates ?? context.promptContextSnapshot?.availableLucideIcons ?? [];
  const nextIconName = extractRequestedLucideIconName(message, availableIcons);
  if (!nextIconName) {
    return null;
  }

  const iconFields = collectIconFieldEntries(context.widget.widgetData).filter((entry) => {
    if (!targetWidget?.iconFieldPaths || targetWidget.iconFieldPaths.length === 0) {
      return true;
    }
    return targetWidget.iconFieldPaths.some((fieldPath) => {
      const normalizedFieldPath = fieldPath.replace(/\[\]/g, "");
      return entry.path.startsWith(normalizedFieldPath);
    });
  });
  const targetPath = resolveIconFieldPath(messageLower, iconFields);
  if (!targetPath) {
    return null;
  }

  const command = `/data set ${targetPath} to ${nextIconName}`;
  console.log(`Debug flow: buildExplicitIconCommandSuggestion result`, { command });
  return command;
}
