export function LayoutVisual({ cols }: { cols: number }) {
  console.log(`Debug flow: LayoutVisual fired with`, { cols });
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-10 border border-slate-300 rounded" />
      ))}
    </div>
  );
}

export function TemplateSkeleton({ templateId }: { templateId: string }) {
  console.log(`Debug flow: TemplateSkeleton fired with`, { templateId });

  switch (templateId) {
    case "metrics-overview":
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 border-2 border-slate-300 rounded bg-slate-50" />
            ))}
          </div>
          <div className="h-12 border-2 border-slate-300 rounded bg-slate-50" />
        </div>
      );

    case "split-dashboard":
      return (
        <div className="flex gap-2">
          <div className="w-1/4 space-y-1">
            <div className="h-6 border-2 border-slate-300 rounded bg-slate-50" />
            <div className="h-6 border-2 border-slate-300 rounded bg-slate-50" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-8 border-2 border-slate-300 rounded bg-slate-50" />
            <div className="h-5 border-2 border-slate-300 rounded bg-slate-50" />
          </div>
        </div>
      );

    case "grid-dashboard":
      return (
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 border-2 border-slate-300 rounded bg-slate-50" />
          ))}
        </div>
      );

    case "analytics-dashboard":
      return (
        <div className="space-y-2">
          <div className="h-12 border-2 border-slate-300 rounded bg-slate-50" />
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 border-2 border-slate-300 rounded bg-slate-50" />
            ))}
          </div>
        </div>
      );

    case "monitoring-dashboard":
      return (
        <div className="space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 border-2 border-slate-300 rounded bg-slate-50" />
          ))}
        </div>
      );

    case "kpi-dashboard":
      return (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-8 border-2 border-slate-300 rounded bg-slate-50" />
              <div className="h-4 border-2 border-slate-300 rounded bg-slate-50" />
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="h-16 border-2 border-slate-300 rounded bg-slate-50 flex items-center justify-center text-xs text-slate-400">
          Template Preview
        </div>
      );
  }
}
