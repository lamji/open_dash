const BUILDER_VAULT_PREFIX = "open-dash:vault:builder";

export function getBuilderVaultKey(projectId: string, scope: string): string {
  console.log(`Debug flow: getBuilderVaultKey fired`, { projectId, scope });
  return `${BUILDER_VAULT_PREFIX}:${projectId}:${scope}`;
}

export function loadBuilderVault<T>(vaultKey: string): T | undefined {
  console.log(`Debug flow: loadBuilderVault fired`, { vaultKey });
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    const raw = window.localStorage.getItem(vaultKey);
    if (!raw) {
      return undefined;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Debug flow: loadBuilderVault failed`, { vaultKey, error });
    return undefined;
  }
}

export function saveBuilderVault<T>(vaultKey: string, value: T): void {
  console.log(`Debug flow: saveBuilderVault fired`, { vaultKey });
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(vaultKey, JSON.stringify(value));
  } catch (error) {
    console.error(`Debug flow: saveBuilderVault failed`, { vaultKey, error });
  }
}

export function clearBuilderVault(vaultKey: string): void {
  console.log(`Debug flow: clearBuilderVault fired`, { vaultKey });
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(vaultKey);
  } catch (error) {
    console.error(`Debug flow: clearBuilderVault failed`, { vaultKey, error });
  }
}
