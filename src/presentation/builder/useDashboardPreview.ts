"use client";

import { useEffect, useState } from "react";
import type { DashboardLayoutRecord } from "@/domain/builder/types";
import { getLayout } from "@/lib/api/builder-layouts";

interface UseDashboardPreviewReturn {
  record: DashboardLayoutRecord | null;
  loading: boolean;
  error: string | null;
}

function getPreviewVaultKey(id: string): string {
  console.log(`Debug flow: getPreviewVaultKey fired`, { id });
  return `open-dash:vault:preview-layout:${id}`;
}

function loadPreviewVault(id: string): DashboardLayoutRecord | null {
  console.log(`Debug flow: loadPreviewVault fired`, { id });
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(getPreviewVaultKey(id));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as DashboardLayoutRecord;
  } catch (error) {
    console.error(`Debug flow: loadPreviewVault failed`, { id, error });
    return null;
  }
}

function savePreviewVault(id: string, layout: DashboardLayoutRecord): void {
  console.log(`Debug flow: savePreviewVault fired`, { id, layoutId: layout.id });
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(getPreviewVaultKey(id), JSON.stringify(layout));
  } catch (error) {
    console.error(`Debug flow: savePreviewVault failed`, { id, error });
  }
}

export function useDashboardPreview(id: string): UseDashboardPreviewReturn {
  console.log(`Debug flow: useDashboardPreview fired`, { id });
  const [record, setRecord] = useState<DashboardLayoutRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`Debug flow: useDashboardPreview useEffect fired`, { id });
    const cachedRecord = loadPreviewVault(id);
    if (cachedRecord) {
      console.log(`Debug flow: useDashboardPreview using vault cache`, {
        id,
        layoutId: cachedRecord.id,
      });
      setRecord(cachedRecord);
      setLoading(false);
      setError(null);
    }

    const load = async () => {
      try {
        const data = await getLayout(id);
        if (!data.ok) throw new Error(data.error ?? "Failed to load layout");
        console.log(`Debug flow: useDashboardPreview loaded`, { name: data.layout?.name, blocks: data.layout?.layout.length });
        if (data.layout) {
          savePreviewVault(id, data.layout);
          setRecord(data.layout);
        }
        setError(null);
      } catch (err) {
        console.error(`Debug flow: useDashboardPreview error`, err);
        if (!cachedRecord) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  return { record, loading, error };
}
