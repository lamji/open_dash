import type { LayoutType } from "@/domain/builder/types";
import { WIDGET_CATEGORIES } from "@/presentation/widgets";
import { BUILDER_CATEGORIES } from "./useBuilder";

export const LAYOUT_OPTIONS: { type: LayoutType; label: string; cols: number }[] = [
  { type: "single", label: "Single Column", cols: 1 },
  { type: "grid-2", label: "2-Column Grid", cols: 2 },
  { type: "grid-3", label: "3-Column Grid", cols: 3 },
  { type: "grid-4", label: "4-Column Grid", cols: 4 },
];

export const SIDEBAR_CATEGORIES = WIDGET_CATEGORIES.filter((category) =>
  (BUILDER_CATEGORIES as readonly string[]).includes(category.id)
);

export const GRID_CLASS: Record<string, string> = {
  single: "grid-cols-1",
  "grid-2": "grid-cols-2",
  "grid-3": "grid-cols-3",
  "grid-4": "grid-cols-4",
};

export const COLUMN_CSS_DRAFT_DEFAULT = [
  "position: relative;",
  "width: 100%;",
  "min-height: 300px;",
  "height: auto;",
  "background: transparent;",
  "padding: 0px;",
  "margin: 0px;",
  "border-radius: 12px;",
  "border: none;",
  "box-shadow: none;",
  "display: flex;",
  "flex-direction: column;",
  "justify-content: flex-start;",
  "align-items: stretch;",
  "overflow: visible;",
].join("\n");

export const BLOCK_CSS_DRAFT_DEFAULT = [
  "background: transparent;",
  "padding: 0px;",
  "margin: 0px;",
  "border-radius: 0px;",
  "border: none;",
  "box-shadow: none;",
  "overflow: visible;",
].join("\n");
