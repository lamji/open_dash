"use client";

import { useEffect, useState } from "react";
import type { DashboardLayoutRecord } from "@/domain/builder/types";
import { getLayout } from "@/lib/api/builder-layouts";

interface UseDashboardPreviewReturn {
  record: DashboardLayoutRecord | null;
  loading: boolean;
  error: string | null;
}

export function useDashboardPreview(id: string): UseDashboardPreviewReturn {
  const [record, setRecord] = useState<DashboardLayoutRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`Debug flow: useDashboardPreview useEffect fired`, { id });
    const load = async () => {
      try {
        const data = await getLayout(id);
        if (!data.ok) throw new Error(data.error ?? "Failed to load layout");
        console.log(`Debug flow: useDashboardPreview loaded`, { name: data.layout?.name, blocks: data.layout?.layout.length });
        if (data.layout) setRecord(data.layout);
      } catch (err) {
        console.error(`Debug flow: useDashboardPreview error`, err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return { record, loading, error };
}
