"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import type {
  LayoutType,
  LayoutBlock,
  NavItem,
  WidgetTypePicker,
  WidgetVariantPicker,
  BlockStyleEditorState,
  GroqStyleContext,
  GroqChatMessage,
  CodeEditorTab,
  BuilderAutosaveState,
} from "@/domain/builder/types";
import type { WidgetTemplate } from "@/domain/widgets/types";
import {
  loadBuilderCustomWidgetTemplates,
  loadBuilderNavItems,
  loadBuilderWidgetTemplates,
} from "@/lib/api/builder-controller";
import { createNavItem, deleteNavItem } from "@/lib/api/builder-nav";
import { postBuilderLog } from "@/lib/api/builder-runtime";
import { saveBuilderLayoutDraft } from "@/lib/api/saveBuilderLayoutDraft";
import { saveBlockStyles, saveWidgetData as saveWidgetDataApi, saveGridRatio as saveGridRatioApi } from "@/lib/api/builder-styles";
import { BUILDER_CATEGORIES } from "./modules/useBuilderController.constants";
import { buildWidgetDataEditorPayload } from "./modules/buildWidgetDataEditorPayload";
import { createApplyTemplateAction } from "./modules/createApplyTemplateAction";
import { createClearSlotContentAction } from "./modules/createClearSlotContentAction";
import { createGenerateAiWidgetAction } from "./modules/createGenerateAiWidgetAction";
import { createPlaceWidgetAction } from "./modules/createPlaceWidgetAction";
import { createRemoveWidgetAction } from "./modules/createRemoveWidgetAction";
import { useBuilderDraftRestore } from "./modules/useBuilderDraftRestore";
import { useBuilderGroqChatSession } from "./modules/useBuilderGroqChatSession";
import { useBuilderGroqMessaging } from "./modules/useBuilderGroqMessaging";
import { normalizeCssDeclarations } from "./modules/normalizeCssDeclarations";
import { scheduleBuilderAutosave } from "./modules/scheduleBuilderAutosave";
import { useBuilderSocketSync } from "./modules/useBuilderSocketSync";
import {
  getBuilderVaultKey,
  loadBuilderVault,
  saveBuilderVault,
} from "./modules/useBuilderController.vault";
import {
  createEmptySlot,
  createBlock,
  findBlockInTree,
  LEGACY_GROUPED_BUTTON_WIDGETS,
  normalizeBlocks,
  removeBlockFromTree,
  updateBlockInTree,
} from "./modules/useBuilderController.helpers";
import { useBuilderPromptContext } from "./modules/useBuilderPromptContext";

export { BUILDER_CATEGORIES };
export { mergeCss } from "./modules/mergeCss";

const BUILDER_AUTOSAVE_DELAY_MS = 1500;
function buildLog(message: string, metadata: Record<string, unknown> = {}) {
  console.log(`[builder-trace] ${message}`, metadata);
  void postBuilderLog(message, metadata).catch(() => {});
}

export function useBuilder() {
  console.log(`Debug flow: useBuilder fired with`, { timestamp: new Date().toISOString() });

  const searchParams = useSearchParams();
  const projectId = searchParams?.get("projectId") ?? "";
  const queryClient = useQueryClient();
  const navItemsQueryKey = ["builder-nav-items", projectId] as const;
  const widgetTemplatesQueryKey = ["builder-widget-templates"] as const;
  const navItemsVaultKey = getBuilderVaultKey(projectId, "nav-items");
  const widgetTemplatesVaultKey = getBuilderVaultKey(projectId, "widget-templates");
  const customWidgetTemplatesVaultKey = getBuilderVaultKey(projectId, "custom-widget-templates");

  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [activeNavItemId, setActiveNavItemId] = useState<string | null>(null);
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
  const [isDraftRestoring, setIsDraftRestoring] = useState(false);
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
  const draftLayoutVaultKey = getBuilderVaultKey(projectId, `draft-layout:${activeNavItemId ?? "global"}`);
  const blocksSignature = useMemo(() => JSON.stringify(blocks), [blocks]);

  latestBlocksRef.current = blocks;
  latestLayoutIdRef.current = layoutId;

  const navItemsQuery = useQuery({
    queryKey: navItemsQueryKey,
    queryFn: (): Promise<NavItem[]> => loadBuilderNavItems(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });

  const widgetTemplatesQuery = useQuery({
    queryKey: widgetTemplatesQueryKey,
    queryFn: (): Promise<WidgetTemplate[]> => loadBuilderWidgetTemplates(),
    staleTime: 5 * 60 * 1000,
    initialData: () => loadBuilderVault<WidgetTemplate[]>(widgetTemplatesVaultKey),
  });

  const customWidgetTemplatesQuery = useQuery({
    queryKey: ["builder-custom-widget-templates", projectId],
    queryFn: (): Promise<WidgetTemplate[]> => loadBuilderCustomWidgetTemplates(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
    initialData: () => loadBuilderVault<WidgetTemplate[]>(customWidgetTemplatesVaultKey),
  });

  const navItems = navItemsQuery.data ?? [];
  const widgetTemplates = widgetTemplatesQuery.data ?? [];
  const customWidgetTemplates = customWidgetTemplatesQuery.data ?? [];
  const loadingNavItems = !!projectId && navItemsQuery.isLoading;
  const loadingTemplates = widgetTemplatesQuery.isLoading || (!!projectId && customWidgetTemplatesQuery.isLoading);

  useEffect(() => {
    console.log(`Debug flow: useBuilder active nav sync effect fired`, {
      activeNavItemId,
      navItemCount: navItems.length,
    });
    if (navItems.length === 0) {
      if (activeNavItemId !== null) {
        setActiveNavItemId(null);
      }
      return;
    }
    const hasActiveNav = activeNavItemId
      ? navItems.some((item) => item.id === activeNavItemId)
      : false;
    if (!hasActiveNav) {
      setActiveNavItemId(navItems[0]?.id ?? null);
    }
  }, [activeNavItemId, navItems]);

  useEffect(() => {
    console.log(`Debug flow: useBuilder nav items vault sync effect fired`, {
      projectId,
      hasData: !!navItemsQuery.data,
    });
    if (!projectId || !navItemsQuery.data) {
      return;
    }
    saveBuilderVault(navItemsVaultKey, navItemsQuery.data);
  }, [navItemsQuery.data, navItemsVaultKey, projectId]);

  useEffect(() => {
    console.log(`Debug flow: useBuilder widget templates vault sync effect fired`, {
      hasData: !!widgetTemplatesQuery.data,
    });
    if (!widgetTemplatesQuery.data) {
      return;
    }
    saveBuilderVault(widgetTemplatesVaultKey, widgetTemplatesQuery.data);
  }, [widgetTemplatesQuery.data, widgetTemplatesVaultKey]);

  useEffect(() => {
    console.log(`Debug flow: useBuilder custom widget templates vault sync effect fired`, {
      projectId,
      hasData: !!customWidgetTemplatesQuery.data,
    });
    if (!projectId || !customWidgetTemplatesQuery.data) {
      return;
    }
    saveBuilderVault(customWidgetTemplatesVaultKey, customWidgetTemplatesQuery.data);
  }, [customWidgetTemplatesQuery.data, customWidgetTemplatesVaultKey, projectId]);

  useBuilderSocketSync({
    projectId,
    queryClient,
  });

  useBuilderDraftRestore({
    projectId,
    activeNavItemId,
    draftLayoutVaultKey,
    draftHydratedRef,
    lastTrackedBlocksSignatureRef,
    remoteAutosaveEnabledRef,
    setIsDraftRestoring,
    setBlocks,
    setLayoutId,
    setAutosaveState,
  });

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
    console.log(`Debug flow: builder local draft vault sync effect fired with`, {
      projectId,
      activeNavItemId,
      blockCount: blocks.length,
      draftHydrated: draftHydratedRef.current,
    });
    if (!projectId || !activeNavItemId || !draftHydratedRef.current) {
      return;
    }
    saveBuilderVault(draftLayoutVaultKey, {
      layoutId,
      blocks,
      lastSavedAt: autosaveState.lastSavedAt,
    });
  }, [activeNavItemId, autosaveState.lastSavedAt, blocks, draftLayoutVaultKey, layoutId, projectId]);

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
      !activeNavItemId ||
      !draftHydratedRef.current ||
      !remoteAutosaveEnabledRef.current ||
      !autosaveState.hasUnsavedChanges ||
      autosaveState.isDraftSavedLocally ||
      savingLayout
    ) {
      return;
    }
    return scheduleBuilderAutosave({
      autosaveDelayMs: BUILDER_AUTOSAVE_DELAY_MS,
      autosaveTimerRef,
      latestBlocksRef,
      latestLayoutIdRef,
      remoteAutosaveEnabledRef,
      projectId,
      activeNavItemId,
      setLayoutId,
      setAutosaveState,
    });
  }, [
    autosaveState.hasUnsavedChanges,
    autosaveState.isDraftSavedLocally,
    blocks.length,
    blocksSignature,
    layoutId,
    activeNavItemId,
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

  const placeWidget = createPlaceWidgetAction({
    setBlocks,
    setShowWidgetVariantPicker,
  });

  const removeWidget = createRemoveWidgetAction({
    setBlocks,
  });

  const clearSlotContent = createClearSlotContentAction({
    setBlocks,
  });

  const applyTemplate = createApplyTemplateAction({
    buildLog,
    setBlocks,
    setShowLayoutPicker,
  });

  const generateAiWidget = createGenerateAiWidgetAction({
    buildPromptContext,
    setBlocks,
  });

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
      setActiveNavItemId(data.item.id);
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
      setActiveNavItemId((prev) => (prev === itemId ? null : prev));
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
    setDataEditorDraft(
      widget?.widgetData
        ? JSON.stringify(
            buildWidgetDataEditorPayload(widget.widgetId, widget.category, widget.widgetData),
            null,
            2
          )
        : ""
    );
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

  const { openGroqChat, closeGroqChat } = useBuilderGroqChatSession({
    blocks,
    buildPromptContext,
    setGroqChatContext,
    setGroqMessages,
    setCssStateHistory,
    setGroqChatOpen,
  });

  const { sendGroqMessage } = useBuilderGroqMessaging({
    blocks,
    groqChatContext,
    groqMessages,
    cssStateHistory,
    layoutId,
    buildPromptContext,
    setBlocks,
    setGroqChatContext,
    setGroqMessages,
    setGroqChatLoading,
    setCssStateHistory,
    setLayoutId,
  });

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
    console.log(`Debug flow: saveLayout fired with`, { name, blockCount: blocks.length, activeNavItemId });
    if (!activeNavItemId) {
      return null;
    }
    setSavingLayout(true);
    try {
      const { layoutId: savedLayoutId, remoteAutosaveEnabled } = await saveBuilderLayoutDraft({
        projectId,
        activeNavItemId,
        name,
        blocks,
      });
      console.log(`Debug flow: saveLayout saved`, { id: savedLayoutId });
      remoteAutosaveEnabledRef.current = remoteAutosaveEnabled;
      setLayoutId(savedLayoutId);
      setAutosaveState((prev) => ({
        ...prev,
        hasUnsavedChanges: false,
        isDraftSavedLocally: true,
        isAutosaving: false,
        lastSavedAt: new Date().toISOString(),
      }));
      return savedLayoutId;
    } catch (err) {
      console.error(`Debug flow: saveLayout error`, err);
      return null;
    } finally {
      setSavingLayout(false);
    }
  };

  const variantTemplates = showWidgetVariantPicker
    ? (showWidgetVariantPicker.category === "custom" ? customWidgetTemplates : widgetTemplates).filter((w) => {
        const result = showWidgetVariantPicker.category === "custom"
          ? true
          : w.category === showWidgetVariantPicker.category
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
    activeNavItemId,
    navItemModalOpen,
    addingNavItem,
    loadingNavItems,
    widgetCategoryModalOpen,
    showLayoutPicker,
    showWidgetTypePicker,
    showWidgetVariantPicker,
    widgetTemplates,
    customWidgetTemplates,
    loadingTemplates,
    variantTemplates,
    previewMode,
    isDraftRestoring,
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
    setActiveNavItemId,
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
    clearSlotContent,
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
