"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import type {
  LayoutType,
  LayoutBlock,
  PlacedWidget,
  WidgetTypePicker,
  WidgetVariantPicker,
  BlockStyleEditorState,
  GroqStyleContext,
  GroqChatMessage,
  CodeEditorTab,
  BuilderAutosaveState,
} from "@/domain/builder/types";
import { BUILDER_CACHE_INVALIDATE_EVENT } from "@/domain/cache/types";
import type { WidgetTemplate } from "@/domain/widgets/types";
import { saveLayout as saveLayoutApi, getLayout, getWidgets } from "@/lib/api/builder-layouts";
import { createNavItem, getNavItems, deleteNavItem } from "@/lib/api/builder-nav";
import { bootstrapSocketServer, generateAiWidgetRequest, postBuilderLog } from "@/lib/api/builder-runtime";
import { saveBlockStyles, generateAiStyle, generateAiWidgetUpdate, generateAiAssistant, saveWidgetData as saveWidgetDataApi, saveGridRatio as saveGridRatioApi } from "@/lib/api/builder-styles";
import type { DashboardTemplate } from "@/lib/dashboard-templates";
import {
  createEmptySlot,
  createBlock,
  findBlockInTree,
  LEGACY_GROUPED_BUTTON_WIDGETS,
  normalizeBlocks,
  removeBlockFromTree,
  TEMPLATE_BLOCK_MAP,
  updateBlockInTree,
} from "./modules/useBuilderController.helpers";
import { useBuilderPromptContext } from "./modules/useBuilderPromptContext";

export const BUILDER_CATEGORIES = [
  "stats",
  "charts",
  "progress",
  "activity",
  "health",
  "timeline",
  "table",
  "funnel",
  "leaderboard",
  "summary",
  "button",
  "dropdown",
  "menu",
  "search",
  "form",
] as const;

const CSS_PROPERTY_ALIASES: Record<string, string> = {
  align: "align-items",
};

const FLEX_LAYOUT_PROPS = new Set([
  "justify-content",
  "align-items",
  "align-content",
  "flex-direction",
  "flex-wrap",
  "row-gap",
  "column-gap",
]);

const NON_FLEX_DISPLAY_VALUES = new Set([
  "block",
  "inline",
  "inline-block",
  "contents",
]);

const BUTTON_INNER_STYLE_KEYWORDS = [
  "button",
  "cta",
  "icon",
  "label",
  "text",
  "background",
  "bg",
  "color",
  "arrow",
  "variant",
  "primary",
  "secondary",
  "outline",
  "ghost",
  "link",
  "destructive",
  "upload",
];

const CONTAINER_LAYOUT_KEYWORDS = [
  "container",
  "contain",
  "wrapper",
  "column",
  "align",
  "justify",
  "display",
  "flex",
  "gap",
  "padding",
  "margin",
  "width",
  "height",
  "position",
  "center",
];

const STYLE_REQUEST_KEYWORDS = [
  "height",
  "width",
  "padding",
  "margin",
  "background",
  "border",
  "shadow",
  "radius",
  "opacity",
  "flex",
  "align",
  "justify",
  "gap",
  "display",
  "overflow",
  "position",
  "transform",
  "transition",
  "font",
  "text-",
  "style",
];

const DATA_OR_CONFIG_KEYWORDS = [
  "color",
  "month",
  "label",
  "data",
  "value",
  "bar",
  "segment",
  "chart",
  "complete",
  "add",
  "change title",
  "update",
  "rename",
  "title",
  "disabled",
  "enable",
  "feature",
  "pagination",
  "sorting",
  "filter",
  "column",
];

const ASSISTANT_INTENT_PREFIXES = [
  "how",
  "what",
  "why",
  "can ",
  "is ",
  "are ",
  "where",
  "which",
  "when",
  "help",
];

const BUILDER_AUTOSAVE_DELAY_MS = 1500;

async function fetchBuilderLayoutState(projectId: string): Promise<{
  ok: boolean;
  status: number;
  draftLayoutId: string | null;
  publishedLayoutId: string | null;
  lastPublishedAt: string | null;
}> {
  console.log(`Debug flow: fetchBuilderLayoutState fired with`, { projectId });
  if (!projectId) {
    return { ok: false, status: 400, draftLayoutId: null, publishedLayoutId: null, lastPublishedAt: null };
  }
  const res = await fetch(`/api/config/builder_layout_state?projectId=${projectId}`);
  if (!res.ok) {
    return { ok: false, status: res.status, draftLayoutId: null, publishedLayoutId: null, lastPublishedAt: null };
  }
  const payload = await res.json() as {
    draftLayoutId?: string | null;
    publishedLayoutId?: string | null;
    lastPublishedAt?: string | null;
  } | null;
  return {
    ok: true,
    status: res.status,
    draftLayoutId: payload?.draftLayoutId ?? null,
    publishedLayoutId: payload?.publishedLayoutId ?? null,
    lastPublishedAt: payload?.lastPublishedAt ?? null,
  };
}

async function saveBuilderLayoutState(
  projectId: string,
  state: {
    draftLayoutId: string | null;
    publishedLayoutId?: string | null;
    lastPublishedAt?: string | null;
  }
): Promise<{ ok: boolean; status: number }> {
  console.log(`Debug flow: saveBuilderLayoutState fired with`, { projectId, state });
  if (!projectId) {
    return { ok: false, status: 400 };
  }
  const res = await fetch(`/api/config/builder_layout_state?projectId=${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  return { ok: res.ok, status: res.status };
}

function detectButtonWidgetDataIntent(messageLower: string): boolean {
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

function detectAssistantIntent(messageLower: string): boolean {
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

function mapAssistantResponseTypeToMode(
  responseType?: "answer" | "execute_styles" | "execute_data" | "execute_config" | "clarify"
): "styles" | "data" | "config" | null {
  console.log(`Debug flow: mapAssistantResponseTypeToMode fired with`, { responseType });
  if (responseType === "execute_styles") {
    return "styles";
  }
  if (responseType === "execute_data") {
    return "data";
  }
  if (responseType === "execute_config") {
    return "config";
  }
  return null;
}

function isCssDeclarationValid(prop: string, val: string): boolean {
  console.log(`Debug flow: isCssDeclarationValid fired with`, { prop, val });
  if (typeof document === "undefined") {
    return true;
  }
  if (prop.startsWith("--")) {
    return true;
  }
  const style = document.createElement("div").style;
  style.setProperty(prop, "");
  style.setProperty(prop, val);
  const appliedValue = style.getPropertyValue(prop).trim();
  const result = appliedValue.length > 0;
  console.log(`Debug flow: isCssDeclarationValid result`, { prop, result, appliedValue });
  return result;
}

function normalizeCssDeclarations(css: string): string {
  console.log(`Debug flow: normalizeCssDeclarations fired with`, { cssLength: css.length });
  if (!css.trim()) {
    return "";
  }
  const normalized = css
    .replace(/,\s*\n\s*/g, "; ")
    .replace(/\n\s*/g, "; ")
    .replace(/\r/g, "");
  const declarations = new Map<string, string>();
  normalized.split(";").forEach((decl) => {
    const colonIdx = decl.indexOf(":");
    if (colonIdx === -1) return;
    const rawProp = decl.slice(0, colonIdx).trim().toLowerCase();
    const val = decl.slice(colonIdx + 1).trim();
    if (!rawProp || !val) return;
    const prop = CSS_PROPERTY_ALIASES[rawProp] ?? rawProp;
    if (!isCssDeclarationValid(prop, val)) {
      return;
    }
    declarations.set(prop, val);
  });
  const hasFlexLayoutProp = Array.from(declarations.keys()).some((prop) => FLEX_LAYOUT_PROPS.has(prop));
  const displayValue = declarations.get("display")?.toLowerCase();
  if (hasFlexLayoutProp && (!displayValue || NON_FLEX_DISPLAY_VALUES.has(displayValue))) {
    declarations.set("display", "flex");
  }
  const result = Array.from(declarations.entries())
    .map(([prop, val]) => `${prop}: ${val}`)
    .join("; ");
  console.log(`Debug flow: normalizeCssDeclarations result`, {
    declarationCount: declarations.size,
    resultLength: result.length,
  });
  return result;
}

export function mergeCss(existing: string, incoming: string): string {
  console.log(`Debug flow: mergeCss fired with`, { existingLen: existing.length, incomingLen: incoming.length });
  const normalizedExisting = normalizeCssDeclarations(existing);
  const normalizedIncoming = normalizeCssDeclarations(incoming);
  const toMap = (css: string): Map<string, string> => {
    const map = new Map<string, string>();
    css.split(";").forEach((decl) => {
      const colonIdx = decl.indexOf(":");
      if (colonIdx === -1) return;
      const prop = decl.slice(0, colonIdx).trim();
      const val = decl.slice(colonIdx + 1).trim();
      if (prop) map.set(prop, val);
    });
    return map;
  };
  const merged = new Map([...toMap(normalizedExisting), ...toMap(normalizedIncoming)]);
  const mergedCss = Array.from(merged.entries())
    .filter(([, v]) => v && v.trim())
    .map(([p, v]) => `${p}: ${v}`)
    .join("; ");
  const result = normalizeCssDeclarations(mergedCss);
  console.log(`Debug flow: mergeCss result`, { resultLen: result.length });
  return result;
}

function buildLog(message: string, metadata: Record<string, unknown> = {}) {
  console.log(`[builder-trace] ${message}`, metadata);
  void postBuilderLog(message, metadata).catch(() => {});
}

function mapWidgetTemplates(
  widgets: (Omit<WidgetTemplate, "widgetData"> & { jsxCode?: string })[]
): WidgetTemplate[] {
  console.log(`Debug flow: mapWidgetTemplates fired with`, { count: widgets.length });
  return widgets.map((w) => ({
    ...w,
    widgetData: (() => {
      try { return JSON.parse(w.jsxCode ?? "{}"); } catch { return {}; }
    })(),
  }));
}

export function useBuilder() {
  console.log(`Debug flow: useBuilder fired with`, { timestamp: new Date().toISOString() });

  const searchParams = useSearchParams();
  const projectId = searchParams?.get("projectId") ?? "";
  const queryClient = useQueryClient();
  const navItemsQueryKey = ["builder-nav-items", projectId] as const;
  const widgetTemplatesQueryKey = ["builder-widget-templates"] as const;

  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [navItemModalOpen, setNavItemModalOpen] = useState(false);
  const [addingNavItem, setAddingNavItem] = useState(false);
  const [widgetCategoryModalOpen, setWidgetCategoryModalOpen] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [layoutInsertTarget, setLayoutInsertTarget] = useState<WidgetTypePicker | null>(null);
  const [showWidgetTypePicker, setShowWidgetTypePicker] = useState<WidgetTypePicker | null>(null);
  const [showWidgetVariantPicker, setShowWidgetVariantPicker] = useState<WidgetVariantPicker | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [savingLayout, setSavingLayout] = useState(false);
  const [cssEditorState, setCssEditorState] = useState<BlockStyleEditorState | null>(null);
  const [codeEditorTab, setCodeEditorTab] = useState<CodeEditorTab>("css");
  const [dataEditorDraft, setDataEditorDraft] = useState("");
  const [functionEditorDraft, setFunctionEditorDraft] = useState("");
  const [groqChatOpen, setGroqChatOpen] = useState(false);
  const [groqChatContext, setGroqChatContext] = useState<GroqStyleContext | null>(null);
  const [groqMessages, setGroqMessages] = useState<GroqChatMessage[]>([]);
  const [groqChatLoading, setGroqChatLoading] = useState(false);
  const [cssStateHistory, setCssStateHistory] = useState<string[]>([]);
  const [layoutId, setLayoutId] = useState<string | null>(null);
  const [dataJsonError, setDataJsonError] = useState<string | null>(null);
  const [gridRatioModal, setGridRatioModal] = useState<{blockId: string} | null>(null);
  const [autosaveState, setAutosaveState] = useState<BuilderAutosaveState>({
    hasUnsavedChanges: false,
    isDraftSavedLocally: true,
    isAutosaving: false,
    lastSavedAt: null,
  });
  const { buildPromptContext } = useBuilderPromptContext(blocks);
  const draftHydratedRef = useRef(false);
  const lastTrackedBlocksSignatureRef = useRef("[]");
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remoteAutosaveEnabledRef = useRef(false);
  const latestBlocksRef = useRef<LayoutBlock[]>(blocks);
  const latestLayoutIdRef = useRef<string | null>(layoutId);
  const blocksSignature = useMemo(() => JSON.stringify(blocks), [blocks]);

  latestBlocksRef.current = blocks;
  latestLayoutIdRef.current = layoutId;

  const navItemsQuery = useQuery({
    queryKey: navItemsQueryKey,
    queryFn: async () => {
      console.log(`Debug flow: navItemsQuery queryFn fired with`, { projectId });
      const data = await getNavItems(projectId);
      if (!data.ok || !data.items) {
        throw new Error(data.error ?? "Failed to load nav items");
      }
      return data.items;
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });

  const widgetTemplatesQuery = useQuery({
    queryKey: widgetTemplatesQueryKey,
    queryFn: async () => {
      console.log(`Debug flow: widgetTemplatesQuery queryFn fired with`, {});
      const data = await getWidgets();
      return mapWidgetTemplates(data.widgets ?? []);
    },
    staleTime: 5 * 60 * 1000,
  });

  const navItems = navItemsQuery.data ?? [];
  const widgetTemplates = widgetTemplatesQuery.data ?? [];
  const loadingNavItems = !!projectId && navItemsQuery.isLoading;
  const loadingTemplates = widgetTemplatesQuery.isLoading;

  useEffect(() => {
    console.log(`Debug flow: useBuilder socket subscription fired with`, { projectId });
    const currentNavItemsQueryKey = ["builder-nav-items", projectId] as const;
    const currentWidgetTemplatesQueryKey = ["builder-widget-templates"] as const;
    let isDisposed = false;
    let socket: ReturnType<typeof io> | null = null;

    const initializeBuilderSocket = async () => {
      console.log(`Debug flow: initializeBuilderSocket fired with`, { projectId });
      try {
        await bootstrapSocketServer();
      } catch (err) {
        console.error(`Debug flow: initializeBuilderSocket bootstrap failed`, err);
        return;
      }

      if (isDisposed) {
        console.log(`Debug flow: initializeBuilderSocket skipped`, {
          projectId,
          reason: "effect disposed before connect",
        });
        return;
      }

      socket = io({
        path: "/api/socket/io",
        addTrailingSlash: false,
      });

      socket.on("connect", () => {
        console.log(`Debug flow: useBuilder socket connect fired with`, {
          projectId,
          socketId: socket?.id,
        });
      });

      socket.on("connect_error", (err) => {
        console.error(`Debug flow: useBuilder socket connect_error fired with`, {
          projectId,
          message: err.message,
        });
      });

      socket.on(BUILDER_CACHE_INVALIDATE_EVENT, (event: { key?: string }) => {
        console.log(`Debug flow: useBuilder socket invalidate fired with`, { event, projectId });
        if (event.key === `sidebar:${projectId}`) {
          void queryClient.invalidateQueries({ queryKey: currentNavItemsQueryKey });
        }
        if (event.key === "widgets:all") {
          void queryClient.invalidateQueries({ queryKey: currentWidgetTemplatesQueryKey });
        }
      });
    };

    void initializeBuilderSocket();

    return () => {
      isDisposed = true;
      console.log(`Debug flow: useBuilder socket cleanup fired with`, { projectId });
      socket?.close();
    };
  }, [projectId, queryClient]);

  useEffect(() => {
    console.log(`Debug flow: builder draft restore effect fired with`, { projectId });
    let cancelled = false;
    const restoreBuilderDraft = async () => {
      if (!projectId) {
        setBlocks([]);
        setLayoutId(null);
        remoteAutosaveEnabledRef.current = false;
        draftHydratedRef.current = true;
        lastTrackedBlocksSignatureRef.current = JSON.stringify([]);
        return;
      }
      try {
        const builderLayoutState = await fetchBuilderLayoutState(projectId);
        if (cancelled) {
          return;
        }
        if (!builderLayoutState.ok) {
          remoteAutosaveEnabledRef.current = false;
          setBlocks([]);
          setLayoutId(null);
          lastTrackedBlocksSignatureRef.current = JSON.stringify([]);
          setAutosaveState((prev) => ({
            ...prev,
            hasUnsavedChanges: false,
            isDraftSavedLocally: false,
            isAutosaving: false,
          }));
          return;
        }
        remoteAutosaveEnabledRef.current = true;
        if (!builderLayoutState.draftLayoutId) {
          setBlocks([]);
          setLayoutId(null);
          draftHydratedRef.current = true;
          lastTrackedBlocksSignatureRef.current = JSON.stringify([]);
          setAutosaveState((prev) => ({
            ...prev,
            hasUnsavedChanges: false,
            isDraftSavedLocally: true,
          }));
          return;
        }
        const layoutResult = await getLayout(builderLayoutState.draftLayoutId);
        if (cancelled) {
          return;
        }
        if (!layoutResult.ok || !layoutResult.layout) {
          setBlocks([]);
          setLayoutId(null);
          draftHydratedRef.current = true;
          lastTrackedBlocksSignatureRef.current = JSON.stringify([]);
          return;
        }
        const restoredBlocks = normalizeBlocks(layoutResult.layout.layout ?? []);
        const restoredSignature = JSON.stringify(restoredBlocks);
        console.log(`Debug flow: builder draft restored`, {
          projectId,
          layoutId: builderLayoutState.draftLayoutId,
          blockCount: restoredBlocks.length,
        });
        lastTrackedBlocksSignatureRef.current = restoredSignature;
        setBlocks(restoredBlocks);
        setLayoutId(builderLayoutState.draftLayoutId);
        setAutosaveState({
          hasUnsavedChanges: false,
          isDraftSavedLocally: true,
          isAutosaving: false,
          lastSavedAt: layoutResult.layout.updatedAt ?? null,
        });
      } catch (err) {
        console.error(`Debug flow: builder draft restore failed`, err);
        setBlocks([]);
        setLayoutId(null);
        remoteAutosaveEnabledRef.current = false;
        lastTrackedBlocksSignatureRef.current = JSON.stringify([]);
      } finally {
        draftHydratedRef.current = true;
      }
    };
    void restoreBuilderDraft();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    console.log(`Debug flow: builder dirty tracking effect fired with`, {
      blockCount: blocks.length,
      draftHydrated: draftHydratedRef.current,
    });
    if (!draftHydratedRef.current) {
      return;
    }
    if (blocksSignature === lastTrackedBlocksSignatureRef.current) {
      return;
    }
    lastTrackedBlocksSignatureRef.current = blocksSignature;
    setAutosaveState((prev) => ({
      ...prev,
      hasUnsavedChanges: true,
      isDraftSavedLocally: false,
    }));
  }, [blocks.length, blocksSignature]);

  useEffect(() => {
    console.log(`Debug flow: builder autosave effect fired with`, {
      hasUnsavedChanges: autosaveState.hasUnsavedChanges,
      isDraftSavedLocally: autosaveState.isDraftSavedLocally,
      layoutId,
      blockCount: blocks.length,
      savingLayout,
    });
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    if (
      !draftHydratedRef.current ||
      !remoteAutosaveEnabledRef.current ||
      !autosaveState.hasUnsavedChanges ||
      autosaveState.isDraftSavedLocally ||
      savingLayout ||
      blocks.length === 0
    ) {
      return;
    }
    autosaveTimerRef.current = setTimeout(() => {
      void (async () => {
        const latestBlocks = latestBlocksRef.current;
        const latestPersistedLayoutId = latestLayoutIdRef.current;
        const anchorBlock = latestBlocks[0];
        console.log(`Debug flow: builder autosave task fired with`, {
          layoutId: latestPersistedLayoutId,
          blockCount: latestBlocks.length,
          anchorBlockId: anchorBlock?.id,
        });
        if (!anchorBlock) {
          return;
        }
        setAutosaveState((prev) => ({ ...prev, isAutosaving: true }));
        const result = await saveBlockStyles(
          anchorBlock.id,
          -1,
          anchorBlock.blockStyles ?? "",
          latestPersistedLayoutId ?? undefined,
          latestBlocks
        );
        if (result.ok) {
          const nextDraftLayoutId = result.layoutId ?? latestPersistedLayoutId;
          const builderLayoutState = await fetchBuilderLayoutState(projectId);
          if (!builderLayoutState.ok) {
            if (builderLayoutState.status === 401) {
              remoteAutosaveEnabledRef.current = false;
            }
            setAutosaveState((prev) => ({
              ...prev,
              isAutosaving: false,
              isDraftSavedLocally: false,
            }));
            return;
          }
          const saveBuilderStateResult = await saveBuilderLayoutState(projectId, {
            draftLayoutId: nextDraftLayoutId,
            publishedLayoutId: builderLayoutState.publishedLayoutId,
            lastPublishedAt: builderLayoutState.lastPublishedAt,
          });
          if (!saveBuilderStateResult.ok) {
            if (saveBuilderStateResult.status === 401) {
              remoteAutosaveEnabledRef.current = false;
            }
            setAutosaveState((prev) => ({
              ...prev,
              isAutosaving: false,
              isDraftSavedLocally: false,
            }));
            return;
          }
          if (result.layoutId && result.layoutId !== latestPersistedLayoutId) {
            setLayoutId(result.layoutId);
          }
          setAutosaveState((prev) => ({
            ...prev,
            hasUnsavedChanges: false,
            isAutosaving: false,
            lastSavedAt: new Date().toISOString(),
            isDraftSavedLocally: true,
          }));
          return;
        }
        if (result.status === 401) {
          remoteAutosaveEnabledRef.current = false;
        }
        console.error(`Debug flow: builder autosave task failed`, result.error);
        setAutosaveState((prev) => ({ ...prev, isAutosaving: false, isDraftSavedLocally: false }));
      })();
    }, BUILDER_AUTOSAVE_DELAY_MS);
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [
    autosaveState.hasUnsavedChanges,
    autosaveState.isDraftSavedLocally,
    blocks.length,
    blocksSignature,
    layoutId,
    projectId,
    savingLayout,
  ]);

  const openLayoutPicker = () => {
    console.log(`Debug flow: openLayoutPicker fired`);
    setLayoutInsertTarget(null);
    setShowLayoutPicker(true);
  };

  const openSlotLayoutPicker = (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: openSlotLayoutPicker fired with`, { blockId, slotIdx });
    setLayoutInsertTarget({ blockId, slotIdx });
    setShowLayoutPicker(true);
  };

  const closeLayoutPicker = () => {
    console.log(`Debug flow: closeLayoutPicker fired`, { layoutInsertTarget });
    setLayoutInsertTarget(null);
    setShowLayoutPicker(false);
  };

  const addBlock = (type: LayoutType) => {
    console.log(`Debug flow: addBlock fired with`, { type, layoutInsertTarget });
    const block = createBlock(type);
    setBlocks((prev) => {
      const normalizedPrev = normalizeBlocks(prev);
      if (!layoutInsertTarget) {
        return [...normalizedPrev, block];
      }
      const result = updateBlockInTree(normalizedPrev, layoutInsertTarget.blockId, (candidate) => {
        const nextSlots = [...candidate.slots];
        const targetSlot = nextSlots[layoutInsertTarget.slotIdx] ?? createEmptySlot();
        nextSlots[layoutInsertTarget.slotIdx] = {
          ...targetSlot,
          childBlocks: [...(targetSlot.childBlocks ?? []), block],
        };
        return { ...candidate, slots: nextSlots };
      });
      return result.updated ? result.blocks : [...normalizedPrev, block];
    });
    setLayoutInsertTarget(null);
    setShowLayoutPicker(false);
  };

  const removeBlock = (blockId: string) => {
    console.log(`Debug flow: removeBlock fired with`, { blockId });
    setBlocks((prev) => removeBlockFromTree(normalizeBlocks(prev), blockId));
  };

  const openWidgetTypePicker = (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: openWidgetTypePicker fired with`, { blockId, slotIdx });
    setShowWidgetTypePicker({ blockId, slotIdx });
  };

  const closeWidgetTypePicker = () => {
    console.log(`Debug flow: closeWidgetTypePicker fired`);
    setShowWidgetTypePicker(null);
  };

  const openWidgetVariantPicker = (blockId: string, slotIdx: number, category: string) => {
    console.log(`Debug flow: openWidgetVariantPicker fired with`, { blockId, slotIdx, category });
    setShowWidgetTypePicker(null);
    setShowWidgetVariantPicker({ blockId, slotIdx, category });
  };

  const closeWidgetVariantPicker = () => {
    console.log(`Debug flow: closeWidgetVariantPicker fired`);
    setShowWidgetVariantPicker(null);
  };

  const placeWidget = (blockId: string, slotIdx: number, template: WidgetTemplate) => {
    console.log(`Debug flow: placeWidget fired with`, { blockId, slotIdx, slug: template.slug });
    const placed: PlacedWidget = {
      widgetId: template.slug,
      category: template.category,
      title: template.title,
      widgetData: template.widgetData ?? {},
    };
    setBlocks((prev) => {
      const result = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
        const newSlots = [...block.slots];
        const existingSlot = newSlots[slotIdx] ?? createEmptySlot();
        newSlots[slotIdx] = { ...existingSlot, widget: placed };
        return { ...block, slots: newSlots };
      });
      return result.blocks;
    });
    setShowWidgetVariantPicker(null);
  };

  const removeWidget = (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: removeWidget fired with`, { blockId, slotIdx });
    setBlocks((prev) => {
      const result = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
        const newSlots = [...block.slots];
        const existingSlot = newSlots[slotIdx] ?? createEmptySlot();
        newSlots[slotIdx] = { ...existingSlot, widget: null };
        return { ...block, slots: newSlots };
      });
      return result.blocks;
    });
  };

  const applyTemplate = (template: DashboardTemplate) => {
    buildLog("applyTemplate:ENTER", { templateId: template.id, templateName: template.name });

    const blockDefs = TEMPLATE_BLOCK_MAP[template.id];
    buildLog("applyTemplate:TEMPLATE_BLOCK_MAP_LOOKUP", {
      templateId: template.id,
      found: !!blockDefs,
      blockDefCount: blockDefs?.length ?? 0,
    });

    if (!blockDefs || blockDefs.length === 0) {
      buildLog("applyTemplate:NO_BLOCK_DEFS_FOUND", { templateId: template.id });
      return;
    }

    blockDefs.forEach((def, defIdx) => {
      buildLog(`applyTemplate:BLOCK_DEF[${defIdx}]`, {
        type: def.type,
        slotCount: def.slots.length,
        slots: def.slots.map((s, si) => ({
          slotIdx: si,
          isNull: s === null,
          widgetId: s?.widgetId ?? null,
          category: s?.category ?? null,
          title: s?.title ?? null,
          hasWidgetData: s?.widgetData ? Object.keys(s.widgetData).length > 0 : false,
        })),
      });
    });

    const newBlocks: LayoutBlock[] = blockDefs.map((def) => createBlock(def.type));

    buildLog("applyTemplate:NEW_BLOCKS_CREATED", {
      templateId: template.id,
      blocksCreated: newBlocks.length,
      blockSummary: newBlocks.map((b) => ({
        id: b.id,
        type: b.type,
        slotCount: b.slots.length,
        populatedSlots: b.slots.filter((s) => s.widget !== null).length,
        emptySlots: b.slots.filter((s) => s.widget === null && (s.childBlocks?.length ?? 0) === 0).length,
      })),
    });

    setBlocks((prev) => {
      const result = [...normalizeBlocks(prev), ...newBlocks];
      buildLog("applyTemplate:SET_BLOCKS", {
        prevBlockCount: prev.length,
        newBlockCount: newBlocks.length,
        totalBlockCount: result.length,
      });
      return result;
    });
    setShowLayoutPicker(false);

    buildLog("applyTemplate:EXIT", { templateId: template.id, blocksCreated: newBlocks.length });
  };

  const generateAiWidget = async (blockId: string, slotIdx: number, prompt: string): Promise<{ ok: boolean; error?: string }> => {
    const timestamp = new Date().toISOString();
    const logEntry = (msg: string, data?: unknown) => {
      const logLine = `[${timestamp}] useBuilder.generateAiWidget - ${msg}${data ? ': ' + JSON.stringify(data) : ''}`;
      console.log(logLine);
    };

    const promptContextResult = buildPromptContext(blockId, slotIdx, "");
    logEntry('START', {
      blockId,
      slotIdx,
      prompt,
      hasPromptContext: !!promptContextResult?.promptContext,
      promptContextLength: promptContextResult?.promptContext.length ?? 0,
    });
    try {
      const data = await generateAiWidgetRequest(prompt, promptContextResult?.promptContext);
      logEntry('API Response received', { ok: data.ok, widgetId: data.widget?.widgetId, hasError: !!data.error });

      if (!data.ok || !data.widget) {
        logEntry('ERROR: Invalid response', { error: data.error });
        return { ok: false, error: data.error ?? "Failed to generate widget" };
      }

      const placed: PlacedWidget = {
        widgetId: data.widget.widgetId,
        category: data.widget.category,
        title: data.widget.title,
        widgetData: data.widget.widgetData,
      };

      logEntry('Widget created, updating state', {
        widgetId: placed.widgetId,
        category: placed.category,
        widgetDataKeys: Object.keys(placed.widgetData),
        widgetDataSample: JSON.stringify(placed.widgetData).substring(0, 200)
      });

      setBlocks((prev) => {
        const result = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
          const newSlots = [...block.slots];
          const existingSlot = newSlots[slotIdx] ?? createEmptySlot();
          newSlots[slotIdx] = { ...existingSlot, widget: placed };
          return { ...block, slots: newSlots };
        });
        return result.blocks;
      });

      logEntry('SUCCESS: Widget placed in state', { blockId, slotIdx });
      return { ok: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      logEntry('EXCEPTION', { error: errorMsg, stack: err instanceof Error ? err.stack : '' });
      return { ok: false, error: errorMsg };
    }
  };

  const openNavItemModal = () => {
    console.log(`Debug flow: openNavItemModal fired`);
    setNavItemModalOpen(true);
  };

  const closeNavItemModal = () => {
    console.log(`Debug flow: closeNavItemModal fired`);
    setNavItemModalOpen(false);
  };

  const openGridRatioModal = (blockId: string) => {
    console.log(`Debug flow: openGridRatioModal fired with`, { blockId });
    setGridRatioModal({ blockId });
  };

  const closeGridRatioModal = () => {
    console.log(`Debug flow: closeGridRatioModal fired`);
    setGridRatioModal(null);
  };

  const saveGridRatio = async (
    blockId: string,
    settings: { ratio: string; display: "grid" | "flex"; justifyContent: string; alignItems: string; gap: string }
  ) => {
    console.log(`Debug flow: saveGridRatio fired with`, { blockId, settings });
    const result = updateBlockInTree(normalizeBlocks(blocks), blockId, (block) => ({
      ...block,
      gridRatio: settings.ratio,
      layoutDisplay: settings.display,
      justifyContent: settings.justifyContent,
      alignItems: settings.alignItems,
      gap: settings.gap,
    }));
    const updated = result.blocks;
    setBlocks(updated);
    closeGridRatioModal();
    const saveResult = await saveGridRatioApi(blockId, settings.ratio, layoutId ?? undefined, updated);
    if (saveResult.ok && saveResult.layoutId && !layoutId) {
      setLayoutId(saveResult.layoutId);
    }
  };

  const addNavItem = async (label: string): Promise<boolean> => {
    console.log(`Debug flow: addNavItem fired with`, { label, projectId });
    if (!label.trim() || !projectId) return false;
    setAddingNavItem(true);
    try {
      const data = await createNavItem(label.trim(), projectId);
      if (!data.ok || !data.item) throw new Error(data.error ?? "Failed to create nav item");
      console.log(`Debug flow: addNavItem saved`, { id: data.item.id });
      await queryClient.invalidateQueries({ queryKey: navItemsQueryKey });
      return true;
    } catch (err) {
      console.error(`Debug flow: addNavItem error`, err);
      return false;
    } finally {
      setAddingNavItem(false);
    }
  };

  const removeNavItem = async (itemId: string): Promise<boolean> => {
    console.log(`Debug flow: removeNavItem fired with`, { itemId, projectId });
    if (!projectId) return false;
    try {
      const data = await deleteNavItem(itemId, projectId);
      if (!data.ok) throw new Error(data.error ?? "Failed to delete nav item");
      console.log(`Debug flow: removeNavItem deleted`, { itemId });
      await queryClient.invalidateQueries({ queryKey: navItemsQueryKey });
      return true;
    } catch (err) {
      console.error(`Debug flow: removeNavItem error`, err);
      return false;
    }
  };

  const openCssEditor = (blockId: string, slotIdx?: number): BlockStyleEditorState | null => {
    console.log(`Debug flow: openCssEditor fired with`, { blockId, slotIdx });
    const block = findBlockInTree(normalizeBlocks(blocks), blockId);
    if (!block) {
      console.error(`Debug flow: openCssEditor missing block`, { blockId, slotIdx });
      return null;
    }
    const isBlockLevel = slotIdx === undefined || slotIdx === -1;

    const currentCss = isBlockLevel
      ? block.blockStyles ?? ""  // Block-level CSS
      : block.columnStyles?.[slotIdx] ?? "";  // Slot/column CSS

    const widget = !isBlockLevel ? block.slots[slotIdx ?? 0]?.widget ?? null : null;

    const editorState: BlockStyleEditorState = {
      blockId,
      slotIdx: slotIdx ?? -1,  // -1 indicates block-level editing
      css: currentCss,
      widgetId: widget?.widgetId,
      widgetTitle: widget?.title,
      widgetCategory: widget?.category,
      widgetData: widget?.widgetData,
      functionCode: widget?.functionCode,
    };

    const editingWhat = isBlockLevel
      ? `block "${block.type}" container styles`
      : widget?.title
        ? `column ${(slotIdx ?? 0) + 1} with widget "${widget.title}"`
        : `column ${(slotIdx ?? 0) + 1} styles`;

    console.log(`[Editor] Opening CSS editor for:`, { blockId, slotIdx: slotIdx ?? 'block-level', editingWhat });

    setCssEditorState(editorState);
    setCodeEditorTab("css");
    setDataEditorDraft(widget?.widgetData ? JSON.stringify(widget.widgetData, null, 2) : "");
    setFunctionEditorDraft(widget?.functionCode ?? "");
    return editorState;
  };

  const closeCssEditor = () => {
    console.log(`Debug flow: closeCssEditor fired`);
    setCssEditorState(null);
  };

  const saveCssStyles = async (css: string) => {
    console.log(`Debug flow: saveCssStyles fired with`, { css, state: cssEditorState });
    if (!cssEditorState) return;
    const { blockId, slotIdx } = cssEditorState;
    const isBlockLevel = slotIdx === -1;
    const normalizedCss = normalizeCssDeclarations(css);

    const normalizedBlocks = normalizeBlocks(blocks);
    const updatedResult = updateBlockInTree(normalizedBlocks, blockId, (block) => {
      if (isBlockLevel) {
        console.log(`[Styles] Saving block-level CSS`, { blockId, css: normalizedCss });
        return { ...block, blockStyles: normalizedCss };
      }
      const styles = block.columnStyles ? [...block.columnStyles] : [];
      styles[slotIdx] = normalizedCss;
      console.log(`[Styles] Saving column CSS`, { blockId, slotIdx, css: normalizedCss });
      return { ...block, columnStyles: styles };
    });

    setBlocks(updatedResult.blocks);

    const result = await saveBlockStyles(blockId, isBlockLevel ? -1 : slotIdx, normalizedCss, layoutId ?? undefined, updatedResult.blocks);
    if (result.ok && result.layoutId && !layoutId) {
      console.log(`Debug flow: saveCssStyles captured layoutId`, { layoutId: result.layoutId });
      setLayoutId(result.layoutId);
    }
    setCssEditorState(null);
  };

  const saveWidgetDataFromEditor = async (widgetDataStr: string): Promise<string | null> => {
    console.log(`Debug flow: saveWidgetDataFromEditor fired with`, { state: cssEditorState, widgetDataLen: widgetDataStr.length });
    if (!cssEditorState) return null;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(widgetDataStr) as Record<string, unknown>;
    } catch {
      console.error(`Debug flow: saveWidgetDataFromEditor JSON parse error`);
      return "Invalid JSON — please check your syntax.";
    }
    const { blockId, slotIdx } = cssEditorState;
    setBlocks((prev) => {
      const result = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
        const newSlots = [...block.slots];
        const existing = newSlots[slotIdx];
        if (existing?.widget) {
          newSlots[slotIdx] = {
            ...existing,
            widget: { ...existing.widget, widgetData: parsed },
          };
        }
        return { ...block, slots: newSlots };
      });
      return result.blocks;
    });
    await saveWidgetDataApi(blockId, slotIdx, parsed, undefined, layoutId ?? undefined);
    console.log(`Debug flow: saveWidgetDataFromEditor complete`, { blockId, slotIdx });
    return null;
  };

  const saveWidgetFunctionFromEditor = async (fnCode: string): Promise<string | null> => {
    console.log(`Debug flow: saveWidgetFunctionFromEditor fired with`, { state: cssEditorState, fnCodeLen: fnCode.length });
    if (!cssEditorState) return null;
    const { blockId, slotIdx } = cssEditorState;
    const block = findBlockInTree(normalizeBlocks(blocks), blockId);
    const currentWidgetData = block?.slots[slotIdx]?.widget?.widgetData;
    if (!currentWidgetData) {
      console.error(`Debug flow: saveWidgetFunctionFromEditor missing widget data`, { blockId, slotIdx });
      return "Widget not found.";
    }

    setBlocks((prev) => {
      const result = updateBlockInTree(normalizeBlocks(prev), blockId, (candidate) => {
        const newSlots = [...candidate.slots];
        const existing = newSlots[slotIdx];
        if (existing?.widget) {
          newSlots[slotIdx] = {
            ...existing,
            widget: { ...existing.widget, functionCode: fnCode },
          };
        }
        return { ...candidate, slots: newSlots };
      });
      return result.blocks;
    });

    await saveWidgetDataApi(blockId, slotIdx, currentWidgetData, fnCode, layoutId ?? undefined);
    console.log(`Debug flow: saveWidgetFunctionFromEditor complete`, { blockId, slotIdx });
    return null;
  };

  const openGroqChat = (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: openGroqChat fired with`, { blockId, slotIdx });
    const block = findBlockInTree(normalizeBlocks(blocks), blockId);
    if (!block) return;
    const isBlockLevel = slotIdx < 0;
    const widget = !isBlockLevel ? block.slots[slotIdx]?.widget ?? null : null;
    const initialCss = isBlockLevel
      ? block.blockStyles ?? ""
      : block.columnStyles?.[slotIdx] ?? "";
    const promptContextResult = buildPromptContext(blockId, slotIdx, initialCss);
    const context: GroqStyleContext = {
      blockId,
      slotIdx,
      currentCss: initialCss,
      blockType: block.type,
      promptContext: promptContextResult?.promptContext,
      promptContextSnapshot: promptContextResult?.snapshot,
      widget: widget ? {
        widgetId: widget.widgetId,
        category: widget.category,
        title: widget.title,
        widgetData: widget.widgetData,
      } : undefined,
    };
    console.log(`Debug flow: openGroqChat built prompt context`, {
      blockId,
      slotIdx,
      hasPromptContext: !!promptContextResult?.promptContext,
      promptContextLength: promptContextResult?.promptContext.length ?? 0,
    });
    setGroqChatContext(context);
    setGroqMessages([]);
    setCssStateHistory([initialCss]);
    setGroqChatOpen(true);
  };

  const closeGroqChat = () => {
    console.log(`Debug flow: closeGroqChat fired`);
    setGroqChatOpen(false);
    setGroqChatContext(null);
    setGroqMessages([]);
    setCssStateHistory([]);
  };

  const sendGroqMessage = async (message: string) => {
    console.log(`Debug flow: sendGroqMessage fired with`, { message, context: groqChatContext });
    if (!groqChatContext || !message.trim()) return;

    // Parse slash command prefix
    let forcedMode: "styles" | "data" | "config" | "help" | null = null;
    let cleanMessage = message;

    if (message.startsWith("/styles ")) {
      forcedMode = "styles";
      cleanMessage = message.slice("/styles ".length).trim();
    } else if (message.startsWith("/data ")) {
      forcedMode = "data";
      cleanMessage = message.slice("/data ".length).trim();
    } else if (message.startsWith("/config ")) {
      forcedMode = "config";
      cleanMessage = message.slice("/config ".length).trim();
    } else if (message === "/help" || message.startsWith("/help ")) {
      forcedMode = "help";
      cleanMessage = message === "/help" ? "help me with this selected target" : message.slice("/help ".length).trim();
    }

    const messageLower = cleanMessage.toLowerCase().trim();
    if (messageLower === "revert" || messageLower === "undo") {
      console.log(`Debug flow: Revert command detected`, { historyLength: cssStateHistory.length });
      if (cssStateHistory.length > 1) {
        const newHistory = [...cssStateHistory];
        newHistory.pop();
        const previousCss = newHistory[newHistory.length - 1];
        setCssStateHistory(newHistory);
        
        const { blockId, slotIdx } = groqChatContext;
        const isBlockLevel = slotIdx < 0;
        const revertedBlocks = updateBlockInTree(normalizeBlocks(blocks), blockId, (block) => {
          if (isBlockLevel) {
            return { ...block, blockStyles: previousCss };
          }
          const styles = block.columnStyles ? [...block.columnStyles] : [];
          styles[slotIdx] = previousCss;
          return { ...block, columnStyles: styles };
        }).blocks;
        setBlocks(revertedBlocks);
        setGroqChatContext((prev) => prev ? { ...prev, currentCss: previousCss } : prev);
        await saveBlockStyles(blockId, slotIdx, previousCss, layoutId ?? undefined, revertedBlocks);
        
        setGroqMessages((prev) => [
          ...prev,
          { role: "user", content: message },
          { role: "assistant", content: "Reverted to previous state." }
        ]);
      } else {
        setGroqMessages((prev) => [
          ...prev,
          { role: "user", content: message },
          { role: "assistant", content: "No previous state to revert to." }
        ]);
      }
      return;
    }

    const userMsg: GroqChatMessage = { role: "user", content: message };
    const updatedHistory = [...groqMessages, userMsg];
    setGroqMessages(updatedHistory);
    setGroqChatLoading(true);

    let resolvedMode: "styles" | "data" | "config" | null =
      forcedMode === "styles" || forcedMode === "data" || forcedMode === "config"
        ? forcedMode
        : null;
    let assistantResultForMessage: Awaited<ReturnType<typeof generateAiAssistant>> | null = null;

    const contextualPromptLength = groqChatContext.promptContext
      ? `${cleanMessage}\n\n${groqChatContext.promptContext}`.length
      : cleanMessage.length;

    try {
      if (forcedMode === "help" || !resolvedMode) {
        assistantResultForMessage = await generateAiAssistant(
          groqChatContext.blockId,
          groqChatContext.slotIdx,
          groqChatContext.blockType,
          groqChatContext.currentCss,
          cleanMessage,
          groqMessages,
          groqChatContext.widget,
          groqChatContext.promptContext
        );
      }

      if (forcedMode === "help" && assistantResultForMessage) {
        const suggestedModeHint = assistantResultForMessage.recommendedMode && assistantResultForMessage.recommendedMode !== "none"
          ? `\n\nSuggested command mode: /${assistantResultForMessage.recommendedMode}`
          : "";
        const assistantContent = (assistantResultForMessage.reply ?? assistantResultForMessage.error ?? "I couldn't answer that yet.")
          + suggestedModeHint;
        setGroqMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
        return;
      }

      if (!resolvedMode && assistantResultForMessage?.ok) {
        const modeFromResponseType = mapAssistantResponseTypeToMode(assistantResultForMessage.responseType);
        const modeFromRecommendation = assistantResultForMessage.recommendedMode && assistantResultForMessage.recommendedMode !== "none"
          ? assistantResultForMessage.recommendedMode
          : null;
        resolvedMode = modeFromResponseType ?? modeFromRecommendation;

        if (!resolvedMode || assistantResultForMessage.responseType === "answer" || assistantResultForMessage.responseType === "clarify") {
          const suggestedModeHint = assistantResultForMessage.recommendedMode && assistantResultForMessage.recommendedMode !== "none"
            ? `\n\nSuggested command mode: /${assistantResultForMessage.recommendedMode}`
            : "";
          const assistantContent = (assistantResultForMessage.reply ?? "I couldn't answer that yet.") + suggestedModeHint;
          setGroqMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
          return;
        }
      }

      if (!resolvedMode) {
        // Fallback heuristic only when assistant routing fails.
        const isStyleRequest = STYLE_REQUEST_KEYWORDS.some((keyword) => messageLower.includes(keyword));
        const isButtonWidget = groqChatContext.widget?.category === "button";
        const shouldRouteButtonVisualToData = isButtonWidget
          && detectButtonWidgetDataIntent(messageLower);
        const hasDataOrConfigKeyword = DATA_OR_CONFIG_KEYWORDS.some((keyword) => messageLower.includes(keyword));
        resolvedMode = (shouldRouteButtonVisualToData || (!isStyleRequest && hasDataOrConfigKeyword))
          ? "data"
          : "styles";
      }

      const isWidgetDataUpdate = resolvedMode === "data" || resolvedMode === "config";
      const widgetUpdateMode: "data" | "config" | undefined =
        resolvedMode === "data" || resolvedMode === "config"
          ? resolvedMode
          : undefined;

      console.log(`Debug flow: sendGroqMessage intent detection`, {
        forcedMode,
        resolvedMode,
        assistantResponseType: assistantResultForMessage?.responseType,
        assistantRecommendedMode: assistantResultForMessage?.recommendedMode,
        isWidgetDataUpdate,
        hasWidget: !!groqChatContext.widget,
        hasPromptContext: !!groqChatContext.promptContext,
        contextualPromptLength,
      });

      if (isWidgetDataUpdate && !groqChatContext.widget) {
        const missingWidgetMessage = "This target has no widget data to edit yet. Select a filled widget slot or ask for /styles to change container layout.";
        setGroqMessages((prev) => [...prev, { role: "assistant", content: missingWidgetMessage }]);
        return;
      }

      if (isWidgetDataUpdate && groqChatContext.widget) {
        const result = await generateAiWidgetUpdate(
          groqChatContext.blockId,
          groqChatContext.slotIdx,
          groqChatContext.widget.widgetData,
          groqChatContext.widget.widgetId,
          groqChatContext.widget.category,
          cleanMessage,
          groqMessages,
          widgetUpdateMode,
          groqChatContext.promptContext
        );

        if (result.ok && result.widgetData) {
          const { blockId, slotIdx } = groqChatContext;
          setBlocks((prev) => {
            const updateResult = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
              const newSlots = [...block.slots];
              const existing = newSlots[slotIdx];
              if (existing?.widget) {
                newSlots[slotIdx] = {
                  ...existing,
                  widget: { ...existing.widget, widgetData: result.widgetData! },
                };
              }
              return { ...block, slots: newSlots };
            });
            return updateResult.blocks;
          });
          setGroqChatContext((prev) => prev && prev.widget ? { 
            ...prev, 
            widget: { ...prev.widget, widgetData: result.widgetData! } 
          } : prev);
          await saveWidgetDataApi(blockId, slotIdx, result.widgetData, undefined, layoutId ?? undefined);
          setGroqMessages((prev) => [...prev, { role: "assistant", content: "Widget data updated successfully." }]);
        } else {
          setGroqMessages((prev) => [...prev, { role: "assistant", content: result.error ?? "Failed to update widget data." }]);
        }
      } else {
        const result = await generateAiStyle(
          groqChatContext.blockId,
          groqChatContext.slotIdx,
          groqChatContext.blockType,
          groqChatContext.currentCss,
          cleanMessage,
          groqMessages,
          groqChatContext.widget,
          resolvedMode === "styles" ? "styles" : undefined,
          groqChatContext.promptContext
        );
        const assistantContent = result.clarificationQuestion ?? result.css ?? "Sorry, could not generate styles.";
        setGroqMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
        if (result.ok && result.needsClarification) {
          console.log(`Debug flow: sendGroqMessage clarification required`, {
            blockId: groqChatContext.blockId,
            slotIdx: groqChatContext.slotIdx,
            question: result.clarificationQuestion,
          });
          return;
        }
        if (result.ok && result.css) {
          const { blockId, slotIdx } = groqChatContext;
          const isBlockLevel = slotIdx < 0;
          const merged = mergeCss(groqChatContext.currentCss, result.css);
          setCssStateHistory((prev) => [...prev, merged]);
          const styledBlocks = updateBlockInTree(normalizeBlocks(blocks), blockId, (block) => {
            if (isBlockLevel) {
              return { ...block, blockStyles: merged };
            }
            const styles = block.columnStyles ? [...block.columnStyles] : [];
            styles[slotIdx] = merged;
            return { ...block, columnStyles: styles };
          }).blocks;
          setBlocks(styledBlocks);
          setGroqChatContext((prev) => prev ? { ...prev, currentCss: merged } : prev);
          const saveResult = await saveBlockStyles(blockId, slotIdx, merged, layoutId ?? undefined, styledBlocks);
          if (saveResult.ok && saveResult.layoutId && !layoutId) {
            console.log(`Debug flow: sendGroqMessage captured layoutId`, { layoutId: saveResult.layoutId });
            setLayoutId(saveResult.layoutId);
          }
        }
      }
    } catch (err) {
      console.error(`Debug flow: sendGroqMessage error`, err);
      setGroqMessages((prev) => [...prev, { role: "assistant", content: "Error processing request." }]);
    } finally {
      setGroqChatLoading(false);
    }
  };

  const openWidgetCategoryModal = () => {
    console.log(`Debug flow: openWidgetCategoryModal fired`);
    setWidgetCategoryModalOpen(true);
  };

  const closeWidgetCategoryModal = () => {
    console.log(`Debug flow: closeWidgetCategoryModal fired`);
    setWidgetCategoryModalOpen(false);
  };

  const togglePreview = () => {
    console.log(`Debug flow: togglePreview fired`, { previewMode: !previewMode });
    setPreviewMode((prev) => !prev);
  };

  const saveLayout = async (name: string): Promise<string | null> => {
    console.log(`Debug flow: saveLayout fired with`, { name, blockCount: blocks.length });
    setSavingLayout(true);
    try {
      const data = await saveLayoutApi(name.trim() || "My Dashboard", blocks);
      if (!data.ok) throw new Error(data.error ?? "Save failed");
      console.log(`Debug flow: saveLayout saved`, { id: data.layout?.id });
      const builderLayoutState = await fetchBuilderLayoutState(projectId);
      if (builderLayoutState.ok) {
        const saveBuilderStateResult = await saveBuilderLayoutState(projectId, {
          draftLayoutId: data.layout?.id ?? null,
          publishedLayoutId: builderLayoutState.publishedLayoutId,
          lastPublishedAt: builderLayoutState.lastPublishedAt,
        });
        remoteAutosaveEnabledRef.current = saveBuilderStateResult.ok;
      } else {
        remoteAutosaveEnabledRef.current = false;
      }
      setLayoutId(data.layout?.id ?? null);
      setAutosaveState((prev) => ({
        ...prev,
        hasUnsavedChanges: false,
        isDraftSavedLocally: true,
        isAutosaving: false,
        lastSavedAt: new Date().toISOString(),
      }));
      return data.layout?.id ?? null;
    } catch (err) {
      console.error(`Debug flow: saveLayout error`, err);
      return null;
    } finally {
      setSavingLayout(false);
    }
  };

  const variantTemplates = showWidgetVariantPicker
    ? widgetTemplates.filter((w) => {
        const result = w.category === showWidgetVariantPicker.category
          && !(showWidgetVariantPicker.category === "button" && LEGACY_GROUPED_BUTTON_WIDGETS.has(w.slug));
        console.log(`Debug flow: variantTemplates filter fired with`, {
          category: showWidgetVariantPicker.category,
          slug: w.slug,
          include: result,
        });
        return result;
      })
    : [];

  return {
    blocks,
    navItems,
    navItemModalOpen,
    addingNavItem,
    loadingNavItems,
    widgetCategoryModalOpen,
    showLayoutPicker,
    showWidgetTypePicker,
    showWidgetVariantPicker,
    widgetTemplates,
    loadingTemplates,
    variantTemplates,
    previewMode,
    savingLayout,
    autosaveState,
    projectId,
    cssEditorState,
    codeEditorTab,
    dataEditorDraft,
    functionEditorDraft,
    setCodeEditorTab,
    setDataEditorDraft,
    setFunctionEditorDraft,
    groqChatOpen,
    groqChatContext,
    groqMessages,
    groqChatLoading,
    layoutId,
    setLayoutId,
    dataJsonError,
    setDataJsonError,
    togglePreview,
    saveLayout,
    openLayoutPicker,
    openSlotLayoutPicker,
    closeLayoutPicker,
    addBlock,
    removeBlock,
    openWidgetTypePicker,
    closeWidgetTypePicker,
    openWidgetVariantPicker,
    closeWidgetVariantPicker,
    placeWidget,
    removeWidget,
    generateAiWidget,
    openNavItemModal,
    closeNavItemModal,
    addNavItem,
    removeNavItem,
    openWidgetCategoryModal,
    closeWidgetCategoryModal,
    openCssEditor,
    closeCssEditor,
    saveCssStyles,
    saveWidgetDataFromEditor,
    saveWidgetFunctionFromEditor,
    openGroqChat,
    closeGroqChat,
    sendGroqMessage,
    applyTemplate,
    gridRatioModal,
    openGridRatioModal,
    closeGridRatioModal,
    saveGridRatio,
  };
}
