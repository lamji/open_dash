import { useEffect } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { BuilderAutosaveState, LayoutBlock } from "@/domain/builder/types";
import { getLayout } from "@/lib/api/builder-layouts";
import { fetchBuilderLayoutState } from "./useBuilderController.autosave";
import { resolveDraftLayoutIdForActiveNav } from "./resolveDraftLayoutIdForActiveNav";
import { clearBuilderVault, loadBuilderVault, saveBuilderVault } from "./useBuilderController.vault";
import { normalizeBlocks } from "./useBuilderController.helpers";

export function useBuilderDraftRestore({
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
}: {
  projectId: string; activeNavItemId: string | null; draftLayoutVaultKey: string;
  draftHydratedRef: MutableRefObject<boolean>; lastTrackedBlocksSignatureRef: MutableRefObject<string>;
  remoteAutosaveEnabledRef: MutableRefObject<boolean>; setIsDraftRestoring: Dispatch<SetStateAction<boolean>>;
  setBlocks: Dispatch<SetStateAction<LayoutBlock[]>>; setLayoutId: Dispatch<SetStateAction<string | null>>;
  setAutosaveState: Dispatch<SetStateAction<BuilderAutosaveState>>;
}) {
  useEffect(() => {
    console.log(`Debug flow: useBuilderDraftRestore effect fired with`, { projectId, activeNavItemId });
    let cancelled = false;
    const restoreBuilderDraft = async () => {
      const localDraft = loadBuilderVault<{
        layoutId: string | null;
        blocks: LayoutBlock[];
        lastSavedAt: string | null;
      }>(draftLayoutVaultKey);
      const normalizedLocalDraftBlocks =
        localDraft && Array.isArray(localDraft.blocks) ? normalizeBlocks(localDraft.blocks) : null;
      const hasLocalDraft = !!normalizedLocalDraftBlocks;
      console.log(`Debug flow: builder draft restore local vault check`, {
        projectId,
        activeNavItemId,
        hasLocalDraft,
        localDraftLayoutId: localDraft?.layoutId ?? null,
        localDraftBlockCount: normalizedLocalDraftBlocks?.length ?? 0,
      });

      setIsDraftRestoring(!hasLocalDraft);
      draftHydratedRef.current = false;
      if (!projectId || !activeNavItemId) {
        setBlocks([]);
        setLayoutId(null);
        remoteAutosaveEnabledRef.current = false;
        draftHydratedRef.current = true;
        lastTrackedBlocksSignatureRef.current = JSON.stringify([]);
        clearBuilderVault(draftLayoutVaultKey);
        setIsDraftRestoring(false);
        return;
      }
      if (normalizedLocalDraftBlocks) {
        const normalizedLocalDraftSignature = JSON.stringify(normalizedLocalDraftBlocks);
        console.log(`Debug flow: builder draft restore primed from local vault`, {
          projectId,
          activeNavItemId,
          layoutId: localDraft?.layoutId ?? null,
          blockCount: normalizedLocalDraftBlocks.length,
        });
        setBlocks(normalizedLocalDraftBlocks);
        setLayoutId(localDraft?.layoutId ?? null);
        lastTrackedBlocksSignatureRef.current = normalizedLocalDraftSignature;
        setAutosaveState((prev) => ({
          ...prev,
          hasUnsavedChanges: false,
          isDraftSavedLocally: true,
          isAutosaving: false,
          lastSavedAt: localDraft?.lastSavedAt ?? null,
        }));
      } else {
        setBlocks([]);
        setLayoutId(null);
      }
      try {
        const builderLayoutState = await fetchBuilderLayoutState(projectId);
        if (cancelled) return;
        if (!builderLayoutState.ok) {
          remoteAutosaveEnabledRef.current = false;
          if (normalizedLocalDraftBlocks) {
            console.log(`Debug flow: builder draft fallback from vault`, {
              projectId,
              layoutId: localDraft?.layoutId ?? null,
              blockCount: normalizedLocalDraftBlocks.length,
              reason: "builder layout state fetch failed",
            });
            console.log(`Debug flow: builder draft fallback normalized vault blocks`, {
              projectId,
              activeNavItemId,
              blockCount: normalizedLocalDraftBlocks.length,
            });
            setBlocks(normalizedLocalDraftBlocks);
            setLayoutId(localDraft?.layoutId ?? null);
            lastTrackedBlocksSignatureRef.current = JSON.stringify(normalizedLocalDraftBlocks);
            setAutosaveState((prev) => ({
              ...prev,
              hasUnsavedChanges: false,
              isDraftSavedLocally: true,
              isAutosaving: false,
              lastSavedAt: localDraft?.lastSavedAt ?? null,
            }));
          } else {
            setBlocks([]);
            setLayoutId(null);
            lastTrackedBlocksSignatureRef.current = JSON.stringify([]);
            setAutosaveState((prev) => ({
              ...prev,
              hasUnsavedChanges: false,
              isDraftSavedLocally: false,
              isAutosaving: false,
            }));
            clearBuilderVault(draftLayoutVaultKey);
          }
          return;
        }
        remoteAutosaveEnabledRef.current = true;
        const currentDraftLayoutId = resolveDraftLayoutIdForActiveNav(builderLayoutState, activeNavItemId);
        if (!currentDraftLayoutId) {
          if (normalizedLocalDraftBlocks) {
            console.log(`Debug flow: builder draft restore retained local vault after missing remote draft`, {
              projectId,
              activeNavItemId,
              layoutId: localDraft?.layoutId ?? null,
              blockCount: normalizedLocalDraftBlocks.length,
            });
            draftHydratedRef.current = true;
            setAutosaveState((prev) => ({
              ...prev,
              hasUnsavedChanges: false,
              isDraftSavedLocally: true,
              isAutosaving: false,
              lastSavedAt: localDraft?.lastSavedAt ?? prev.lastSavedAt,
            }));
            return;
          }
          setBlocks([]);
          setLayoutId(null);
          draftHydratedRef.current = true;
          lastTrackedBlocksSignatureRef.current = JSON.stringify([]);
          setAutosaveState((prev) => ({
            ...prev,
            hasUnsavedChanges: false,
            isDraftSavedLocally: true,
          }));
          clearBuilderVault(draftLayoutVaultKey);
          return;
        }
        const layoutResult = await getLayout(currentDraftLayoutId);
        if (cancelled) return;
        if (!layoutResult.ok || !layoutResult.layout) {
          if (normalizedLocalDraftBlocks) {
            console.log(`Debug flow: builder draft restore retained local vault after layout fetch miss`, {
              projectId,
              activeNavItemId,
              layoutId: localDraft?.layoutId ?? null,
              blockCount: normalizedLocalDraftBlocks.length,
            });
            draftHydratedRef.current = true;
            return;
          }
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
          activeNavItemId,
          layoutId: currentDraftLayoutId,
          blockCount: restoredBlocks.length,
        });
        lastTrackedBlocksSignatureRef.current = restoredSignature;
        setBlocks(restoredBlocks);
        setLayoutId(currentDraftLayoutId);
        setAutosaveState({
          hasUnsavedChanges: false,
          isDraftSavedLocally: true,
          isAutosaving: false,
          lastSavedAt: layoutResult.layout.updatedAt ?? null,
        });
        saveBuilderVault(draftLayoutVaultKey, {
          layoutId: currentDraftLayoutId,
          blocks: restoredBlocks,
          lastSavedAt: layoutResult.layout.updatedAt ?? null,
        });
      } catch (err) {
        console.error(`Debug flow: builder draft restore failed`, err);
        if (normalizedLocalDraftBlocks) {
          console.log(`Debug flow: builder draft fallback from vault`, {
            projectId,
            layoutId: localDraft?.layoutId ?? null,
            blockCount: normalizedLocalDraftBlocks.length,
            reason: "restore exception",
          });
          console.log(`Debug flow: builder draft exception normalized vault blocks`, {
            projectId,
            activeNavItemId,
            blockCount: normalizedLocalDraftBlocks.length,
          });
          setBlocks(normalizedLocalDraftBlocks);
          setLayoutId(localDraft?.layoutId ?? null);
          lastTrackedBlocksSignatureRef.current = JSON.stringify(normalizedLocalDraftBlocks);
          setAutosaveState((prev) => ({
            ...prev,
            hasUnsavedChanges: false,
            isDraftSavedLocally: true,
            isAutosaving: false,
            lastSavedAt: localDraft?.lastSavedAt ?? null,
          }));
        } else {
          setBlocks([]);
          setLayoutId(null);
          remoteAutosaveEnabledRef.current = false;
          lastTrackedBlocksSignatureRef.current = JSON.stringify([]);
        }
      } finally {
        draftHydratedRef.current = true;
        if (!cancelled) {
          setIsDraftRestoring(false);
        }
      }
    };
    void restoreBuilderDraft();
    return () => {
      cancelled = true;
    };
  }, [
    activeNavItemId,
    draftHydratedRef,
    draftLayoutVaultKey,
    lastTrackedBlocksSignatureRef,
    projectId,
    remoteAutosaveEnabledRef,
    setAutosaveState,
    setBlocks,
    setIsDraftRestoring,
    setLayoutId,
  ]);
}
