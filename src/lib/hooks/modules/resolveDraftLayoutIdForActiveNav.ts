export function resolveDraftLayoutIdForActiveNav(
  state: {
    draftLayoutId: string | null;
    draftLayoutByNavItemId: Record<string, string | null>;
    activeNavItemId: string | null;
  },
  activeNavItemId: string
): string | null {
  const hasScopedDraft = Object.prototype.hasOwnProperty.call(
    state.draftLayoutByNavItemId,
    activeNavItemId
  );
  console.log(`Debug flow: resolveDraftLayoutIdForActiveNav fired`, {
    activeNavItemId,
    serverActiveNavItemId: state.activeNavItemId,
    hasScopedDraft,
    scopedDraftCount: Object.keys(state.draftLayoutByNavItemId).length,
    hasGlobalDraft: !!state.draftLayoutId,
  });
  if (hasScopedDraft) {
    return state.draftLayoutByNavItemId[activeNavItemId] ?? null;
  }
  const shouldUseLegacyGlobalDraft =
    Object.keys(state.draftLayoutByNavItemId).length === 0 &&
    state.activeNavItemId === activeNavItemId;
  return shouldUseLegacyGlobalDraft ? state.draftLayoutId : null;
}
