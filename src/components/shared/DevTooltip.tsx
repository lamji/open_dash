"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface DevTooltipProps {
  children: React.ReactNode;
  id: string | number;
  enabled: boolean;
  type?: string;
}

export function DevTooltip({ children, id, enabled, type }: DevTooltipProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(String(id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block w-full">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-2 bg-slate-900 text-white">
          <code className="text-xs font-mono">
            {type && <span className="text-slate-400">{type}: </span>}
            ID: {id}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 hover:bg-slate-700"
            onClick={handleCopy}
            data-test-id={`dev-tooltip-copy-${id}`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </Button>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
