import { getWidgetSpec } from "@/lib/widget-spec-registry";

export function buildWidgetDataEditorPayload(
  widgetId: string | undefined,
  widgetCategory: string | undefined,
  widgetData: Record<string, unknown> | undefined
): Record<string, unknown> {
  console.log(`Debug flow: buildWidgetDataEditorPayload fired with`, {
    widgetId,
    widgetCategory,
    hasWidgetData: !!widgetData,
  });
  if (!widgetData) {
    return {};
  }

  const payload = JSON.parse(JSON.stringify(widgetData)) as Record<string, unknown>;
  const spec = widgetId && widgetCategory ? getWidgetSpec(widgetId, widgetCategory, payload) : null;

  const inferIconValue = (entry: Record<string, unknown>, path: string): string => {
    const badge = typeof entry.badge === "string" ? entry.badge.toLowerCase() : "";
    const status = typeof entry.status === "string" ? entry.status.toLowerCase() : "";
    const level = typeof entry.level === "string" ? entry.level.toLowerCase() : "";

    if (path.toLowerCase().includes("header")) {
      return widgetCategory === "leaderboard" ? "Award" : "Sparkles";
    }
    if (badge === "gold" || level === "gold") return "Trophy";
    if (badge === "silver" || level === "silver") return "Medal";
    if (badge === "bronze" || level === "bronze") return "Award";
    if (status.includes("error")) return "TriangleAlert";
    if (status.includes("warning")) return "TriangleAlert";
    if (status.includes("success")) return "CheckCircle2";
    if (status.includes("active")) return "Activity";
    return "Sparkles";
  };

  const ensureIconPath = (target: Record<string, unknown>, path: string) => {
    if (!path) {
      return;
    }

    const segments = path.split(".").filter(Boolean);
    const visit = (current: unknown, index: number, pathCursor: string) => {
      if (current === null || current === undefined || index >= segments.length) {
        return;
      }

      const segment = segments[index]!;
      const isArraySegment = segment.endsWith("[]");
      const cleanSegment = segment.replace(/\[\]$/, "");

      if (typeof current !== "object") {
        return;
      }

      const record = current as Record<string, unknown>;

      if (isArraySegment) {
        const currentArray = Array.isArray(record[cleanSegment])
          ? (record[cleanSegment] as unknown[])
          : [];
        if (currentArray.length === 0) {
          return;
        }
        currentArray.forEach((entry) => {
          visit(entry, index + 1, `${pathCursor}${cleanSegment}[].`);
        });
        return;
      }

      if (index === segments.length - 1) {
        if (
          typeof record[cleanSegment] !== "string" ||
          String(record[cleanSegment]).trim().length === 0
        ) {
          record[cleanSegment] = inferIconValue(record, `${pathCursor}${cleanSegment}`);
        }
        return;
      }

      if (!record[cleanSegment] || typeof record[cleanSegment] !== "object") {
        record[cleanSegment] = {};
      }

      visit(record[cleanSegment], index + 1, `${pathCursor}${cleanSegment}.`);
    };

    visit(target, 0, "");
  };

  spec?.iconFieldPaths.forEach((path) => {
    ensureIconPath(payload, path);
  });

  if (widgetId === "agent-leaderboard") {
    const entries = Array.isArray(payload.entries)
      ? payload.entries.map((entry) => {
          if (!entry || typeof entry !== "object") {
            return entry;
          }
          const typedEntry = entry as Record<string, unknown>;
          const badge = typeof typedEntry.badge === "string" ? typedEntry.badge : null;
          const defaultIcon =
            badge === "gold" || badge === "silver" || badge === "bronze"
              ? "Trophy"
              : undefined;
          const defaultIconColor =
            badge === "gold"
              ? "#eab308"
              : badge === "silver"
                ? "#94a3b8"
                : badge === "bronze"
                  ? "#b45309"
                  : undefined;

          return {
            ...typedEntry,
            icon: typeof typedEntry.icon === "string" ? typedEntry.icon : defaultIcon,
            iconColor:
              typeof typedEntry.iconColor === "string"
                ? typedEntry.iconColor
                : defaultIconColor,
          };
        })
      : widgetData.entries;

    return {
      ...payload,
      headerIcon:
        typeof payload.headerIcon === "string" ? payload.headerIcon : "Award",
      headerIconColor:
        typeof payload.headerIconColor === "string"
          ? payload.headerIconColor
          : "#eab308",
      entries,
    };
  }

  return payload;
}
