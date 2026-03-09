import type { LayoutBlock } from "@/domain/builder/types";
import { saveLayout as saveLayoutApi } from "@/lib/api/builder-layouts";
import { saveBlockStyles } from "@/lib/api/builder-styles";

export type BuilderLayoutState = {
  ok: boolean;
  status: number;
  draftLayoutId: string | null;
  draftLayoutByNavItemId: Record<string, string | null>;
  activeNavItemId: string | null;
  publishedLayoutId: string | null;
  lastPublishedAt: string | null;
};

export type BuilderLayoutStateSaveInput = {
  draftLayoutId: string | null;
  draftLayoutByNavItemId?: Record<string, string | null>;
  activeNavItemId?: string | null;
  publishedLayoutId?: string | null;
  lastPublishedAt?: string | null;
};

export type BuilderAutosaveResult = {
  ok: boolean;
  status: number;
  error?: string;
  nextLayoutId?: string | null;
  shouldUpdateLayoutId?: boolean;
};

export async function fetchBuilderLayoutState(projectId: string): Promise<BuilderLayoutState> {
  console.log(`Debug flow: fetchBuilderLayoutState fired with`, { projectId });
  if (!projectId) {
    return {
      ok: false,
      status: 400,
      draftLayoutId: null,
      draftLayoutByNavItemId: {},
      activeNavItemId: null,
      publishedLayoutId: null,
      lastPublishedAt: null,
    };
  }
  const res = await fetch(`/api/config/builder_layout_state?projectId=${projectId}`);
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      draftLayoutId: null,
      draftLayoutByNavItemId: {},
      activeNavItemId: null,
      publishedLayoutId: null,
      lastPublishedAt: null,
    };
  }
  const payload = await res.json() as {
    draftLayoutId?: string | null;
    draftLayoutByNavItemId?: Record<string, string | null>;
    activeNavItemId?: string | null;
    publishedLayoutId?: string | null;
    lastPublishedAt?: string | null;
  } | null;
  return {
    ok: true,
    status: res.status,
    draftLayoutId: payload?.draftLayoutId ?? null,
    draftLayoutByNavItemId:
      payload?.draftLayoutByNavItemId && typeof payload.draftLayoutByNavItemId === "object"
        ? payload.draftLayoutByNavItemId
        : {},
    activeNavItemId: payload?.activeNavItemId ?? null,
    publishedLayoutId: payload?.publishedLayoutId ?? null,
    lastPublishedAt: payload?.lastPublishedAt ?? null,
  };
}

export async function saveBuilderLayoutState(
  projectId: string,
  state: BuilderLayoutStateSaveInput
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

async function persistDraftLayoutForNavItem(params: {
  projectId: string;
  activeNavItemId: string;
  draftLayoutId: string | null;
}): Promise<{ ok: boolean; status: number }> {
  console.log(`Debug flow: persistDraftLayoutForNavItem fired with`, params);
  const builderLayoutState = await fetchBuilderLayoutState(params.projectId);
  if (!builderLayoutState.ok) {
    return { ok: false, status: builderLayoutState.status };
  }
  const nextDraftLayoutByNavItemId = {
    ...builderLayoutState.draftLayoutByNavItemId,
    [params.activeNavItemId]: params.draftLayoutId,
  };
  return saveBuilderLayoutState(params.projectId, {
    draftLayoutId: params.draftLayoutId,
    draftLayoutByNavItemId: nextDraftLayoutByNavItemId,
    activeNavItemId: params.activeNavItemId,
    publishedLayoutId: builderLayoutState.publishedLayoutId,
    lastPublishedAt: builderLayoutState.lastPublishedAt,
  });
}

export async function autosaveEmptyBuilderLayout(params: {
  projectId: string;
  activeNavItemId: string;
}): Promise<BuilderAutosaveResult> {
  console.log(`Debug flow: autosaveEmptyBuilderLayout fired with`, params);
  const emptyLayoutSaveResult = await saveLayoutApi("Draft Layout", []);
  if (!emptyLayoutSaveResult.ok) {
    return {
      ok: false,
      status: 500,
      error: emptyLayoutSaveResult.error ?? "Failed to save empty draft layout.",
    };
  }
  const nextDraftLayoutId = emptyLayoutSaveResult.layout?.id ?? null;
  const saveBuilderStateResult = await persistDraftLayoutForNavItem({
    projectId: params.projectId,
    activeNavItemId: params.activeNavItemId,
    draftLayoutId: nextDraftLayoutId,
  });
  if (!saveBuilderStateResult.ok) {
    return {
      ok: false,
      status: saveBuilderStateResult.status,
      error: "Failed to persist empty draft layout state.",
    };
  }
  return {
    ok: true,
    status: 200,
    nextLayoutId: nextDraftLayoutId,
    shouldUpdateLayoutId: true,
  };
}

export async function autosaveBuilderBlockStyles(params: {
  projectId: string;
  activeNavItemId: string;
  latestPersistedLayoutId: string | null;
  anchorBlockId: string;
  anchorBlockStyles: string;
  latestBlocks: LayoutBlock[];
}): Promise<BuilderAutosaveResult> {
  console.log(`Debug flow: autosaveBuilderBlockStyles fired with`, {
    projectId: params.projectId,
    activeNavItemId: params.activeNavItemId,
    latestPersistedLayoutId: params.latestPersistedLayoutId,
    anchorBlockId: params.anchorBlockId,
    blockCount: params.latestBlocks.length,
  });
  const result = await saveBlockStyles(
    params.anchorBlockId,
    -1,
    params.anchorBlockStyles,
    params.latestPersistedLayoutId ?? undefined,
    params.latestBlocks
  );
  if (!result.ok) {
    return {
      ok: false,
      status: result?.status as number,
      error: result.error ?? "Failed to autosave block styles.",
    };
  }
  const nextDraftLayoutId = result.layoutId ?? params.latestPersistedLayoutId;
  const saveBuilderStateResult = await persistDraftLayoutForNavItem({
    projectId: params.projectId,
    activeNavItemId: params.activeNavItemId,
    draftLayoutId: nextDraftLayoutId ?? null,
  });
  if (!saveBuilderStateResult.ok) {
    return {
      ok: false,
      status: saveBuilderStateResult.status,
      error: "Failed to persist autosaved draft layout state.",
    };
  }
  return {
    ok: true,
    status: 200,
    nextLayoutId: nextDraftLayoutId,
    shouldUpdateLayoutId:
      Boolean(result.layoutId) && result.layoutId !== params.latestPersistedLayoutId,
  };
}
