import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { BuilderAutosaveState, LayoutBlock } from "@/domain/builder/types";
import {
  autosaveBuilderBlockStyles,
  autosaveEmptyBuilderLayout,
} from "./useBuilderController.autosave";
import { normalizeBlocks } from "./useBuilderController.helpers";

export function scheduleBuilderAutosave({
  autosaveDelayMs,
  autosaveTimerRef,
  latestBlocksRef,
  latestLayoutIdRef,
  remoteAutosaveEnabledRef,
  projectId,
  activeNavItemId,
  setLayoutId,
  setAutosaveState,
}: {
  autosaveDelayMs: number;
  autosaveTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  latestBlocksRef: MutableRefObject<LayoutBlock[]>;
  latestLayoutIdRef: MutableRefObject<string | null>;
  remoteAutosaveEnabledRef: MutableRefObject<boolean>;
  projectId: string;
  activeNavItemId: string;
  setLayoutId: Dispatch<SetStateAction<string | null>>;
  setAutosaveState: Dispatch<SetStateAction<BuilderAutosaveState>>;
}) {
  console.log(`Debug flow: scheduleBuilderAutosave fired with`, {
    projectId,
    activeNavItemId,
  });

  autosaveTimerRef.current = setTimeout(() => {
    void (async () => {
      const latestBlocks = normalizeBlocks(latestBlocksRef.current);
      const latestPersistedLayoutId = latestLayoutIdRef.current;
      const anchorBlock = latestBlocks[0];

      console.log(`Debug flow: builder autosave task fired with`, {
        layoutId: latestPersistedLayoutId,
        blockCount: latestBlocks.length,
        anchorBlockId: anchorBlock?.id,
      });

      if (!anchorBlock) {
        console.log(`Debug flow: builder autosave empty-layout branch fired`, {
          activeNavItemId,
          projectId,
          latestPersistedLayoutId,
        });
        const emptyLayoutSaveResult = await autosaveEmptyBuilderLayout({
          projectId,
          activeNavItemId,
        });
        if (!emptyLayoutSaveResult.ok) {
          if (emptyLayoutSaveResult.status === 401) {
            remoteAutosaveEnabledRef.current = false;
          }
          console.error(`Debug flow: builder autosave empty-layout save failed`, {
            error: emptyLayoutSaveResult.error,
          });
          setAutosaveState((prev) => ({
            ...prev,
            isAutosaving: false,
            isDraftSavedLocally: false,
          }));
          return;
        }
        setLayoutId(emptyLayoutSaveResult.nextLayoutId ?? null);
        setAutosaveState((prev) => ({
          ...prev,
          hasUnsavedChanges: false,
          isAutosaving: false,
          lastSavedAt: new Date().toISOString(),
          isDraftSavedLocally: true,
        }));
        return;
      }

      setAutosaveState((prev) => ({ ...prev, isAutosaving: true }));
      const result = await autosaveBuilderBlockStyles({
        projectId,
        activeNavItemId,
        latestPersistedLayoutId,
        anchorBlockId: anchorBlock.id,
        anchorBlockStyles: anchorBlock.blockStyles ?? "",
        latestBlocks,
      });

      if (result.ok) {
        if (result.shouldUpdateLayoutId) {
          setLayoutId(result.nextLayoutId ?? null);
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
  }, autosaveDelayMs);

  return () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
  };
}
