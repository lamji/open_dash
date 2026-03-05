"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "html" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  console.log(`Debug flow: CodeBlock fired with`, { language, codeLength: code.length });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-lg border border-[var(--border)] bg-slate-950 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
        <span className="text-xs font-mono text-slate-400">{language}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-slate-400 hover:bg-slate-800 hover:text-white"
          onClick={handleCopy}
          data-test-id="code-block-copy-btn"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm">
          <code className="font-mono text-slate-100">{code}</code>
        </pre>
      </div>
    </div>
  );
}
