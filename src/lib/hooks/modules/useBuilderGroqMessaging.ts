import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { BuilderPromptContextSnapshot, GroqChatMessage, GroqStyleContext, LayoutBlock } from "@/domain/builder/types";
import {
  generateAiAssistant,
  generateAiStyle,
  generateAiWidgetUpdate,
  saveBlockStyles,
  saveWidgetData as saveWidgetDataApi,
} from "@/lib/api/builder-styles";
import { buildExplicitWidgetDataCommandSuggestion } from "./buildExplicitWidgetDataCommandSuggestion";
import { detectButtonWidgetDataIntent } from "./detectButtonWidgetDataIntent";
import { isDirectStyleExecutionIntent } from "./isDirectStyleExecutionIntent";
import { mapAssistantResponseTypeToMode } from "./mapAssistantResponseTypeToMode";
import { mergeCss } from "./mergeCss";
import { DATA_OR_CONFIG_KEYWORDS, STYLE_REQUEST_KEYWORDS } from "./useBuilderController.constants";
import { findBlockInTree, normalizeBlocks, updateBlockInTree } from "./useBuilderController.helpers";

export function useBuilderGroqMessaging({
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
}: {
  blocks: LayoutBlock[]; groqChatContext: GroqStyleContext | null; groqMessages: GroqChatMessage[]; cssStateHistory: string[]; layoutId: string | null;
  buildPromptContext: (blockId: string, slotIdx: number, currentCss: string) => { snapshot: BuilderPromptContextSnapshot; promptContext: string } | null;
  setBlocks: Dispatch<SetStateAction<LayoutBlock[]>>; setGroqChatContext: Dispatch<SetStateAction<GroqStyleContext | null>>;
  setGroqMessages: Dispatch<SetStateAction<GroqChatMessage[]>>; setGroqChatLoading: Dispatch<SetStateAction<boolean>>;
  setCssStateHistory: Dispatch<SetStateAction<string[]>>; setLayoutId: Dispatch<SetStateAction<string | null>>;
}) {
  const sendGroqMessage = useCallback(async (message: string) => {
    console.log(`Debug flow: sendGroqMessage fired with`, { message, context: groqChatContext });
    if (!groqChatContext || !message.trim()) return;
    const currentBlock = findBlockInTree(normalizeBlocks(blocks), groqChatContext.blockId);
    const currentIsBlockLevel = groqChatContext.slotIdx < 0;
    const currentWidget = !currentIsBlockLevel ? currentBlock?.slots[groqChatContext.slotIdx]?.widget ?? null : null;
    const refreshedPromptContextResult = buildPromptContext(groqChatContext.blockId, groqChatContext.slotIdx, groqChatContext.currentCss);
    const effectivePromptContext = refreshedPromptContextResult?.promptContext ?? groqChatContext.promptContext;
    const effectivePromptContextSnapshot = refreshedPromptContextResult?.snapshot ?? groqChatContext.promptContextSnapshot;
    const effectiveWidget = currentWidget ? {
      widgetId: currentWidget.widgetId,
      category: currentWidget.category,
      title: currentWidget.title,
      widgetData: currentWidget.widgetData,
    } : groqChatContext.widget;
    setGroqChatContext((prev) => prev ? {
      ...prev,
      promptContext: effectivePromptContext,
      promptContextSnapshot: effectivePromptContextSnapshot,
      widget: effectiveWidget,
    } : prev);
    console.log(`Debug flow: sendGroqMessage refreshed prompt context`, { blockId: groqChatContext.blockId, slotIdx: groqChatContext.slotIdx, hasPromptContext: !!effectivePromptContext, promptContextLength: effectivePromptContext?.length ?? 0, hasWidget: !!effectiveWidget });
    let forcedMode: "styles" | "data" | "config" | "help" | null = null;
    let cleanMessage = message;
    if (message.startsWith("/styles ")) { forcedMode = "styles"; cleanMessage = message.slice("/styles ".length).trim(); }
    else if (message.startsWith("/data ")) { forcedMode = "data"; cleanMessage = message.slice("/data ".length).trim(); }
    else if (message.startsWith("/config ")) { forcedMode = "config"; cleanMessage = message.slice("/config ".length).trim(); }
    else if (message === "/help" || message.startsWith("/help ")) {
      forcedMode = "help";
      cleanMessage = message === "/help" ? "help me with this selected target" : message.slice("/help ".length).trim();
    }
    const messageLower = cleanMessage.toLowerCase().trim();
    if (messageLower === "revert" || messageLower === "undo") {
      console.log(`Debug flow: Revert command detected`, { historyLength: cssStateHistory.length });
      if (cssStateHistory.length > 1) {
        const newHistory = [...cssStateHistory];
        newHistory.pop();
        const previousCss = newHistory[newHistory.length - 1] ?? "";
        setCssStateHistory(newHistory);
        const { blockId, slotIdx } = groqChatContext;
        const isBlockLevel = slotIdx < 0;
        const revertedBlocks = updateBlockInTree(normalizeBlocks(blocks), blockId, (block) => isBlockLevel
          ? { ...block, blockStyles: previousCss }
          : { ...block, columnStyles: (() => { const styles = block.columnStyles ? [...block.columnStyles] : []; styles[slotIdx] = previousCss; return styles; })() }).blocks;
        setBlocks(revertedBlocks);
        setGroqChatContext((prev) => prev ? { ...prev, currentCss: previousCss } : prev);
        await saveBlockStyles(blockId, slotIdx, previousCss, layoutId ?? undefined, revertedBlocks);
        setGroqMessages((prev) => [...prev, { role: "user", content: message }, { role: "assistant", content: "Reverted to previous state." }]);
      } else {
        setGroqMessages((prev) => [...prev, { role: "user", content: message }, { role: "assistant", content: "No previous state to revert to." }]);
      }
      return;
    }
    const userMsg: GroqChatMessage = { role: "user", content: message };
    setGroqMessages([...groqMessages, userMsg]);
    setGroqChatLoading(true);
    const explicitDataCommand = buildExplicitWidgetDataCommandSuggestion(groqChatContext, cleanMessage);
    const explicitDataCommandHint = explicitDataCommand ? `\n\nSuggested command: \`${explicitDataCommand}\`` : "";
    let resolvedMode: "styles" | "data" | "config" | null = forcedMode === "styles" || forcedMode === "data" || forcedMode === "config" ? forcedMode : null;
    let assistantResultForMessage: Awaited<ReturnType<typeof generateAiAssistant>> | null = null;
    const contextualPromptLength = effectivePromptContext ? `${cleanMessage}\n\n${effectivePromptContext}`.length : cleanMessage.length;
    try {
      const shouldAutoExecuteStyles = isDirectStyleExecutionIntent(messageLower);
      if (forcedMode === "help" || !resolvedMode) assistantResultForMessage = await generateAiAssistant(groqChatContext.blockId, groqChatContext.slotIdx, groqChatContext.blockType, groqChatContext.currentCss, cleanMessage, groqMessages, effectiveWidget, effectivePromptContext);
      if (forcedMode === "help" && assistantResultForMessage) {
        const suggestedModeHint = assistantResultForMessage.recommendedMode && assistantResultForMessage.recommendedMode !== "none"
          ? `\n\nSuggested command mode: /${assistantResultForMessage.recommendedMode}` : "";
        const assistantContent = (assistantResultForMessage.reply ?? assistantResultForMessage.error ?? "I couldn't answer that yet.")
          + suggestedModeHint + explicitDataCommandHint;
        setGroqMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
        return;
      }
      if (!resolvedMode && assistantResultForMessage?.ok) {
        const modeFromResponseType = mapAssistantResponseTypeToMode(assistantResultForMessage.responseType);
        const modeFromRecommendation = assistantResultForMessage.recommendedMode && assistantResultForMessage.recommendedMode !== "none"
          ? assistantResultForMessage.recommendedMode : null;
        resolvedMode = modeFromResponseType ?? modeFromRecommendation;
        const shouldPromoteAnswerToStyles = shouldAutoExecuteStyles && modeFromRecommendation === "styles"
          && (assistantResultForMessage.responseType === "answer" || assistantResultForMessage.responseType === "clarify");
        if (shouldPromoteAnswerToStyles) resolvedMode = "styles";
        if ((!resolvedMode || assistantResultForMessage.responseType === "answer" || assistantResultForMessage.responseType === "clarify") && !shouldPromoteAnswerToStyles) {
          const suggestedModeHint = assistantResultForMessage.recommendedMode && assistantResultForMessage.recommendedMode !== "none"
            ? `\n\nSuggested command mode: /${assistantResultForMessage.recommendedMode}` : "";
          const assistantContent = (assistantResultForMessage.reply ?? "I couldn't answer that yet.") + suggestedModeHint + explicitDataCommandHint;
          setGroqMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
          return;
        }
      }
      if (!resolvedMode) {
        const isStyleRequest = STYLE_REQUEST_KEYWORDS.some((keyword) => messageLower.includes(keyword));
        const isButtonWidget = effectiveWidget?.category === "button";
        const shouldRouteButtonVisualToData = isButtonWidget && detectButtonWidgetDataIntent(messageLower);
        const hasDataOrConfigKeyword = DATA_OR_CONFIG_KEYWORDS.some((keyword) => messageLower.includes(keyword));
        resolvedMode = shouldRouteButtonVisualToData || (!isStyleRequest && hasDataOrConfigKeyword) ? "data" : "styles";
      }
      const isWidgetDataUpdate = resolvedMode === "data" || resolvedMode === "config";
      const widgetUpdateMode: "data" | "config" | undefined =
        resolvedMode === "data" || resolvedMode === "config" ? resolvedMode : undefined;
      console.log(`Debug flow: sendGroqMessage intent detection`, { forcedMode, resolvedMode, assistantResponseType: assistantResultForMessage?.responseType, assistantRecommendedMode: assistantResultForMessage?.recommendedMode, isWidgetDataUpdate, hasWidget: !!effectiveWidget, hasPromptContext: !!effectivePromptContext, contextualPromptLength });
      if (isWidgetDataUpdate && !effectiveWidget) {
        setGroqMessages((prev) => [...prev, { role: "assistant", content: "This target has no widget data to edit yet. Select a filled widget slot or ask for /styles to change container layout." }]);
        return;
      }
      if (isWidgetDataUpdate && effectiveWidget) {
        const result = await generateAiWidgetUpdate(groqChatContext.blockId, groqChatContext.slotIdx, effectiveWidget.widgetData, effectiveWidget.widgetId, effectiveWidget.category, explicitDataCommand ?? cleanMessage, groqMessages, widgetUpdateMode, effectivePromptContext);
        if (result.ok && result.widgetData) {
          const { blockId, slotIdx } = groqChatContext;
          setBlocks((prev) => updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
            const newSlots = [...block.slots], existing = newSlots[slotIdx];
            if (existing?.widget) newSlots[slotIdx] = { ...existing, widget: { ...existing.widget, widgetData: result.widgetData! } };
            return { ...block, slots: newSlots };
          }).blocks);
          const nextPromptContextResult = buildPromptContext(blockId, slotIdx, groqChatContext.currentCss);
          setGroqChatContext((prev) => prev && prev.widget ? {
            ...prev,
            promptContext: nextPromptContextResult?.promptContext ?? prev.promptContext,
            promptContextSnapshot: nextPromptContextResult?.snapshot ?? prev.promptContextSnapshot,
            widget: { ...prev.widget, widgetData: result.widgetData! },
          } : prev);
          await saveWidgetDataApi(blockId, slotIdx, result.widgetData, undefined, layoutId ?? undefined);
          const successMessage = explicitDataCommand ? `Widget data updated successfully.\n\nResolved command: \`${explicitDataCommand}\`` : "Widget data updated successfully.";
          setGroqMessages((prev) => [...prev, { role: "assistant", content: successMessage }]);
        } else {
          setGroqMessages((prev) => [...prev, { role: "assistant", content: (result.error ?? "Failed to update widget data.") + explicitDataCommandHint }]);
        }
      } else {
        const result = await generateAiStyle(groqChatContext.blockId, groqChatContext.slotIdx, groqChatContext.blockType, groqChatContext.currentCss, cleanMessage, groqMessages, effectiveWidget, resolvedMode === "styles" ? "styles" : undefined, effectivePromptContext);
        setGroqMessages((prev) => [...prev, { role: "assistant", content: result.clarificationQuestion ?? result.css ?? "Sorry, could not generate styles." }]);
        if (result.ok && result.needsClarification) {
          console.log(`Debug flow: sendGroqMessage clarification required`, { blockId: groqChatContext.blockId, slotIdx: groqChatContext.slotIdx, question: result.clarificationQuestion });
          return;
        }
        if (result.ok && result.css) {
          const { blockId, slotIdx } = groqChatContext;
          const isBlockLevel = slotIdx < 0;
          const merged = mergeCss(groqChatContext.currentCss, result.css);
          setCssStateHistory((prev) => [...prev, merged]);
          const styledBlocks = updateBlockInTree(normalizeBlocks(blocks), blockId, (block) => isBlockLevel
            ? { ...block, blockStyles: merged }
            : { ...block, columnStyles: (() => { const styles = block.columnStyles ? [...block.columnStyles] : []; styles[slotIdx] = merged; return styles; })() }).blocks;
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
  }, [blocks, buildPromptContext, cssStateHistory, groqChatContext, groqMessages, layoutId, setBlocks, setCssStateHistory, setGroqChatContext, setGroqChatLoading, setGroqMessages, setLayoutId]);

  return { sendGroqMessage };
}
