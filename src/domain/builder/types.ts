import type { WidgetCategory } from "@/domain/widgets/types";

export type LayoutType = "single" | "grid-2" | "grid-3" | "grid-4";

export type CodeEditorTab = "css" | "data" | "icons" | "function";

export interface PlacedWidget {
  widgetId: string;
  category: WidgetCategory;
  title: string;
  widgetData: Record<string, unknown>;
  functionCode?: string;
}

export interface BuilderPromptWidgetContext {
  slotIdx: number;
  widgetId: string;
  category: WidgetCategory;
  title: string;
  widgetData: Record<string, unknown>;
  functionCode?: string;
  slotCss?: string;
  blockCss?: string;
  widgetDataKeys?: string[];
  widgetDataPaths?: string[];
  configFieldPaths?: string[];
  iconFieldPaths?: string[];
  iconCandidates?: string[];
}

export interface BuilderPromptContextSnapshot {
  blockId: string;
  blockType: LayoutType;
  slotIdx: number;
  isBlockLevel: boolean;
  currentCss: string;
  blockStyles?: string;
  columnStyles?: string[];
  targetWidget?: BuilderPromptWidgetContext;
  siblingWidgets: BuilderPromptWidgetContext[];
  nestedWidgets: BuilderPromptWidgetContext[];
  availableLucideIcons: string[];
}

export interface LayoutSlot {
  widget: PlacedWidget | null;
  childBlocks?: LayoutBlock[];
}

export type LayoutDisplay = "grid" | "flex";

export interface LayoutBlock {
  id: string;
  type: LayoutType;
  slots: LayoutSlot[];
  blockStyles?: string;  // CSS for the block container itself
  columnStyles?: string[];  // CSS for each slot/column within the block
  gridRatio?: string;  // CSS grid-template-columns value (e.g., "7fr 5fr")
  layoutDisplay?: LayoutDisplay;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
}

export interface BlockStyleEditorState {
  blockId: string;
  slotIdx: number;
  css: string;
  widgetId?: string;
  widgetTitle?: string;
  widgetCategory?: string;
  widgetData?: Record<string, unknown>;
  functionCode?: string;
}

export interface GroqStyleContext {
  blockId: string;
  slotIdx: number;
  currentCss: string;
  blockType: LayoutType;
  promptContext?: string;
  promptContextSnapshot?: BuilderPromptContextSnapshot;
  widget?: {
    widgetId: string;
    category: string;
    title: string;
    widgetData: Record<string, unknown>;
  };
}

export interface GroqChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface WidgetTypePicker {
  blockId: string;
  slotIdx: number;
}

export interface WidgetVariantPicker {
  blockId: string;
  slotIdx: number;
  category: string;
}

export interface BuilderState {
  blocks: LayoutBlock[];
  showLayoutPicker: boolean;
  showWidgetTypePicker: WidgetTypePicker | null;
  showWidgetVariantPicker: WidgetVariantPicker | null;
}

export interface DashboardLayoutRecord {
  id: string;
  name: string;
  layout: LayoutBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface BuilderDraftPayload {
  version: 1;
  projectId: string;
  layoutId: string | null;
  blocks: LayoutBlock[];
  savedAt: string;
}

export interface BuilderAutosaveState {
  hasUnsavedChanges: boolean;
  isDraftSavedLocally: boolean;
  isAutosaving: boolean;
  lastSavedAt: string | null;
}

export interface IconFieldEntry {
  path: string;
  value: string;
}

export interface WidgetFieldEntry {
  path: string;
  value: string | number | boolean;
}

export interface NavItem {
  id: string;
  label: string;
  slug: string;
  order: number;
  projectId: string;
}
