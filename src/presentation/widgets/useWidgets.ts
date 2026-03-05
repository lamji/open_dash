"use client";

import { useState, useEffect } from "react";
import type { WidgetCategory } from "@/domain/widgets/types";

export interface WidgetTemplate {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  jsxCode: string;
  widgetData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

function parseWidgetData(jsxCode: string): Record<string, unknown> {
  console.log(`Debug flow: parseWidgetData fired with`, { length: jsxCode?.length });
  try {
    const parsed = JSON.parse(jsxCode);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

export function useWidgets() {
  console.log(`Debug flow: useWidgets fired with`, { timestamp: new Date().toISOString() });

  const [selectedCategory, setSelectedCategory] = useState<WidgetCategory | "all">("all");
  const [widgets, setWidgets] = useState<WidgetTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    console.log(`Debug flow: useWidgets useEffect fired - fetching widgets`);
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    console.log(`Debug flow: fetchWidgets fired`);
    try {
      const response = await fetch('/api/widgets');
      const data = await response.json();
      const raw: Omit<WidgetTemplate, "widgetData">[] = data.widgets || [];
      const withData: WidgetTemplate[] = raw.map(w => ({
        ...w,
        widgetData: parseWidgetData(w.jsxCode),
      }));
      console.log(`Debug flow: fetchWidgets response`, { count: withData.length });
      setWidgets(withData);
    } catch (error) {
      console.error('Debug flow: fetchWidgets error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: WidgetCategory | "all") => {
    console.log(`Debug flow: handleCategoryChange fired with`, { category });
    setSelectedCategory(category);
  };

  const copyWidgetId = async (widgetSlug: string) => {
    console.log(`Debug flow: copyWidgetId fired with`, { widgetSlug });
    try {
      await navigator.clipboard.writeText(widgetSlug);
      setCopiedId(widgetSlug);
      setTimeout(() => setCopiedId(null), 2000);
      console.log(`Debug flow: copyWidgetId success`, { widgetSlug });
    } catch (error) {
      console.error('Debug flow: copyWidgetId error', error);
    }
  };

  const filteredWidgets = selectedCategory === "all" 
    ? widgets 
    : widgets.filter(w => w.category === selectedCategory);

  return {
    selectedCategory,
    handleCategoryChange,
    copyWidgetId,
    widgets: filteredWidgets,
    loading,
    copiedId,
  };
}
