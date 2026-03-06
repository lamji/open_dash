export type CacheChangeAction = "set" | "invalidate";

export interface CacheChangeEvent {
  key: string;
  action: CacheChangeAction;
  timestamp: string;
}

export const BUILDER_CACHE_INVALIDATE_EVENT = "builder-cache-invalidate";
