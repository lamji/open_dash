import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  BuilderPromptContextSnapshot,
  GroqChatMessage,
  GroqStyleContext,
  LayoutBlock,
} from "@/domain/builder/types";
import { findBlockInTree, normalizeBlocks } from "./useBuilderController.helpers";

export function useBuilderGroqChatSession({
  blocks,
  buildPromptContext,
  setGroqChatContext,
  setGroqMessages,
  setCssStateHistory,
  setGroqChatOpen,
}: {
  blocks: LayoutBlock[];
  buildPromptContext: (blockId: string, slotIdx: number, currentCss: string) => {
    snapshot: BuilderPromptContextSnapshot;
    promptContext: string;
  } | null;
  setGroqChatContext: Dispatch<SetStateAction<GroqStyleContext | null>>;
  setGroqMessages: Dispatch<SetStateAction<GroqChatMessage[]>>;
  setCssStateHistory: Dispatch<SetStateAction<string[]>>;
  setGroqChatOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const openGroqChat = useCallback((blockId: string, slotIdx: number) => {
    console.log(`Debug flow: openGroqChat fired with`, { blockId, slotIdx });
    const block = findBlockInTree(normalizeBlocks(blocks), blockId);
    if (!block) return;
    const isBlockLevel = slotIdx < 0;
    const widget = !isBlockLevel ? block.slots[slotIdx]?.widget ?? null : null;
    const initialCss = isBlockLevel ? block.blockStyles ?? "" : block.columnStyles?.[slotIdx] ?? "";
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
  }, [blocks, buildPromptContext, setCssStateHistory, setGroqChatContext, setGroqChatOpen, setGroqMessages]);

  const closeGroqChat = useCallback(() => {
    console.log(`Debug flow: closeGroqChat fired`);
    setGroqChatOpen(false);
    setGroqChatContext(null);
    setGroqMessages([]);
    setCssStateHistory([]);
  }, [setCssStateHistory, setGroqChatContext, setGroqChatOpen, setGroqMessages]);

  return { openGroqChat, closeGroqChat };
}
