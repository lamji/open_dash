import type { LayoutBlock } from "@/domain/builder/types";
import { saveLayout } from "@/lib/api/builder-layouts";
import {
  fetchBuilderLayoutState,
  saveBuilderLayoutState,
} from "@/lib/hooks/modules/useBuilderController.autosave";

export async function saveBuilderLayoutDraft({
  projectId,
  activeNavItemId,
  name,
  blocks,
}: {
  projectId: string;
  activeNavItemId: string;
  name: string;
  blocks: LayoutBlock[];
}): Promise<{ layoutId: string | null; remoteAutosaveEnabled: boolean }> {
  console.log(`Debug flow: saveBuilderLayoutDraft fired`, {
    projectId,
    activeNavItemId,
    name,
    blockCount: blocks.length,
  });

  const data = await saveLayout(name.trim() || "My Dashboard", blocks);
  if (!data.ok) {
    throw new Error(data.error ?? "Save failed");
  }

  const layoutId = data.layout?.id ?? null;
  const builderLayoutState = await fetchBuilderLayoutState(projectId);

  if (!builderLayoutState.ok) {
    return {
      layoutId,
      remoteAutosaveEnabled: false,
    };
  }

  const nextDraftLayoutByNavItemId = {
    ...builderLayoutState.draftLayoutByNavItemId,
    [activeNavItemId]: layoutId,
  };

  const saveBuilderStateResult = await saveBuilderLayoutState(projectId, {
    draftLayoutId: layoutId,
    draftLayoutByNavItemId: nextDraftLayoutByNavItemId,
    activeNavItemId,
    publishedLayoutId: builderLayoutState.publishedLayoutId,
    lastPublishedAt: builderLayoutState.lastPublishedAt,
  });

  return {
    layoutId,
    remoteAutosaveEnabled: saveBuilderStateResult.ok,
  };
}
