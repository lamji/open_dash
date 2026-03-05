"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface DevTooltipProps {
  children: React.ReactNode;
  id: string | number;
  enabled: boolean;
  type?: string;
  className?: string;
  styles?: React.CSSProperties;
}

export function DevTooltip({ children, id, enabled, type, className, styles }: DevTooltipProps) {
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
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <div className="inline-block w-full">
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-md bg-slate-900 text-white p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-yellow-300">
              #{id}
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
          </div>
          {type && (
            <div className="text-[10px] text-slate-400">
              Type: <span className="text-slate-300">{type}</span>
            </div>
          )}
          {className && (
            <div className="border-t border-slate-700 pt-2">
              <div className="text-[10px] text-slate-400 mb-1">Classes:</div>
              <code className="text-xs font-mono text-blue-300 break-all">{className}</code>
            </div>
          )}
          {styles && Object.keys(styles).length > 0 && (
            <div className="border-t border-slate-700 pt-2">
              <div className="text-[10px] text-slate-400 mb-1">CSS Selector with Styles:</div>
              <code className="text-xs font-mono text-green-300 break-all">
                #{id} {"{"}
                {Object.entries(styles).map(([key, value], index, arr) => (
                  <div key={key} className="pl-2">
                    {key}: {String(value)};{index < arr.length - 1 ? "" : ""}
                  </div>
                ))}
                {"}"}
              </code>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
