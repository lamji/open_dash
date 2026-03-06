"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";
import {
  Loader2,
  Save,
  Sparkles,
  X,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import type {
  BlockStyleEditorState,
  CodeEditorTab,
  GroqChatMessage,
  GroqStyleContext,
} from "@/domain/builder/types";

export function BuilderCodeEditorDialog({
  cssEditorState,
  closeCssEditor,
  setDataJsonError,
  codeEditorTab,
  setCodeEditorTab,
  cssEditorDraft,
  setCssEditorDraft,
  dataEditorDraft,
  setDataEditorDraft,
  functionEditorDraft,
  setFunctionEditorDraft,
  dataJsonError,
  saveCssStyles,
  saveWidgetDataFromEditor,
  saveWidgetFunctionFromEditor,
}: {
  cssEditorState: BlockStyleEditorState | null;
  closeCssEditor: () => void;
  setDataJsonError: Dispatch<SetStateAction<string | null>>;
  codeEditorTab: CodeEditorTab;
  setCodeEditorTab: (tab: CodeEditorTab) => void;
  cssEditorDraft: string;
  setCssEditorDraft: Dispatch<SetStateAction<string>>;
  dataEditorDraft: string;
  setDataEditorDraft: (value: string) => void;
  functionEditorDraft: string;
  setFunctionEditorDraft: (value: string) => void;
  dataJsonError: string | null;
  saveCssStyles: (css: string) => void;
  saveWidgetDataFromEditor: (widgetDataStr: string) => Promise<string | null>;
  saveWidgetFunctionFromEditor: (fnCode: string) => Promise<string | null>;
}) {
  console.log(`Debug flow: BuilderCodeEditorDialog fired with`, {
    isOpen: !!cssEditorState,
    codeEditorTab,
    hasDataJsonError: !!dataJsonError,
  });
  return (
    <Dialog
      open={!!cssEditorState}
      onOpenChange={(open) => {
        if (!open) {
          closeCssEditor();
          setDataJsonError(null);
        }
      }}
    >
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden bg-[#1e1e1e] border border-slate-700 [&_[data-slot=dialog-close]]:text-white"
        data-test-id="builder-css-editor-modal"
      >
        <DialogTitle className="sr-only">Edit Styles</DialogTitle>
        <div className="flex items-center gap-0 bg-[#2d2d2d] border-b border-slate-700" data-test-id="builder-css-editor-titlebar">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1e1e1e] border-r border-slate-700">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-slate-400 px-3 py-2 font-mono">
            {cssEditorState?.slotIdx === -1
              ? "Block Container Styles (No widget selected)"
              : cssEditorState?.widgetTitle
                ? `${cssEditorState.widgetTitle} (Widget) — Column ${(cssEditorState?.slotIdx ?? 0) + 1}`
                : `Column ${(cssEditorState?.slotIdx ?? 0) + 1} Styles (CSS only)`}
          </span>
        </div>

        <Tabs
          value={codeEditorTab}
          onValueChange={(value) => {
            setCodeEditorTab(value as CodeEditorTab);
            setDataJsonError(null);
          }}
          data-test-id="builder-code-editor-tabs"
        >
          <TabsList className="w-full justify-start rounded-none bg-[#2d2d2d] border-b border-slate-700 px-2 pt-1" data-test-id="builder-code-editor-tablist">
            <TabsTrigger
              value="css"
              className="text-xs data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-slate-200 text-slate-500 rounded-t-sm px-3 py-1.5"
              data-test-id="builder-tab-css"
            >
              CSS
            </TabsTrigger>
            {cssEditorState?.widgetData && Object.keys(cssEditorState.widgetData).length > 0 && (
              <>
                <TabsTrigger
                  value="data"
                  className="text-xs data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-slate-200 text-slate-500 rounded-t-sm px-3 py-1.5"
                  data-test-id="builder-tab-data"
                >
                  Data
                </TabsTrigger>
                <TabsTrigger
                  value="function"
                  className="text-xs data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-slate-200 text-slate-500 rounded-t-sm px-3 py-1.5"
                  data-test-id="builder-tab-function"
                >
                  Function
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="css" className="mt-0" data-test-id="builder-tab-content-css">
            <textarea
              value={cssEditorDraft}
              onChange={(e) => setCssEditorDraft(e.target.value)}
              spellCheck={false}
              placeholder={"/* Add CSS declarations */\nbackground-color: #fff;\npadding: 16px;\nborder-radius: 8px;"}
              className="w-full h-56 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm px-4 py-4 resize-none outline-none placeholder:text-slate-600 border-0"
              style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
              data-test-id="builder-css-editor-textarea"
            />
            <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-t border-slate-700">
              <span className="text-[10px] text-slate-500 font-mono">CSS • Plain declarations only (no selectors)</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={closeCssEditor} className="text-slate-400" data-test-id="builder-css-editor-cancel-btn">Cancel</Button>
                <Button
                  size="sm"
                  onClick={() => {
                    saveCssStyles(cssEditorDraft);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-test-id="builder-css-editor-save-btn"
                >
                  <Save className="w-3.5 h-3.5 mr-1" /> Save styles
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="mt-0" data-test-id="builder-tab-content-data">
            <textarea
              value={dataEditorDraft}
              onChange={(e) => {
                setDataEditorDraft(e.target.value);
                setDataJsonError(null);
              }}
              spellCheck={false}
              placeholder={"{\n  \"title\": \"My Widget\",\n  \"value\": \"$0\"\n}"}
              className="w-full h-56 bg-[#1e1e1e] text-[#9cdcfe] font-mono text-sm px-4 py-4 resize-none outline-none placeholder:text-slate-600 border-0"
              style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
              data-test-id="builder-data-editor-textarea"
            />
            {dataJsonError && (
              <div className="px-4 py-1.5 bg-[#1e1e1e] border-t border-red-800" data-test-id="builder-data-json-error">
                <span className="text-[10px] text-red-400 font-mono">{dataJsonError}</span>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-t border-slate-700">
              <span className="text-[10px] text-slate-500 font-mono">JSON • Widget data object</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={closeCssEditor} className="text-slate-400" data-test-id="builder-data-editor-cancel-btn">Cancel</Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    const error = await saveWidgetDataFromEditor(dataEditorDraft);
                    if (error) {
                      setDataJsonError(error);
                    } else {
                      closeCssEditor();
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-test-id="builder-data-editor-save-btn"
                >
                  <Save className="w-3.5 h-3.5 mr-1" /> Save data
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="function" className="mt-0" data-test-id="builder-tab-content-function">
            <textarea
              value={functionEditorDraft}
              onChange={(e) => {
                setFunctionEditorDraft(e.target.value);
              }}
              spellCheck={false}
              placeholder={"// Add JavaScript function code\nfunction processData(data) {\n  return data;\n}"}
              className="w-full h-56 bg-[#1e1e1e] text-[#dcdcaa] font-mono text-sm px-4 py-4 resize-none outline-none placeholder:text-slate-600 border-0"
              style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
              data-test-id="builder-function-editor-textarea"
            />
            <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-t border-slate-700">
              <span className="text-[10px] text-slate-500 font-mono">JavaScript • Widget function code</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={closeCssEditor} className="text-slate-400" data-test-id="builder-function-editor-cancel-btn">Cancel</Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    const error = await saveWidgetFunctionFromEditor(functionEditorDraft);
                    if (error) {
                      setDataJsonError(error);
                    } else {
                      closeCssEditor();
                    }
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  data-test-id="builder-function-editor-save-btn"
                >
                  <Save className="w-3.5 h-3.5 mr-1" /> Save function
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export function BuilderAiChatPanel({
  groqChatOpen,
  groqChatContext,
  groqMessages,
  groqChatLoading,
  closeGroqChat,
  groqInputRef,
  groqInput,
  setGroqInput,
  slashMenuOpen,
  setSlashMenuOpen,
  slashMenuHighlighted,
  setSlashMenuHighlighted,
  sendGroqMessage,
}: {
  groqChatOpen: boolean;
  groqChatContext: GroqStyleContext | null;
  groqMessages: GroqChatMessage[];
  groqChatLoading: boolean;
  closeGroqChat: () => void;
  groqInputRef: RefObject<HTMLInputElement | null>;
  groqInput: string;
  setGroqInput: Dispatch<SetStateAction<string>>;
  slashMenuOpen: boolean;
  setSlashMenuOpen: Dispatch<SetStateAction<boolean>>;
  slashMenuHighlighted: number;
  setSlashMenuHighlighted: Dispatch<SetStateAction<number>>;
  sendGroqMessage: (message: string) => void;
}) {
  console.log(`Debug flow: BuilderAiChatPanel fired with`, {
    groqChatOpen,
    messageCount: groqMessages.length,
    groqChatLoading,
  });
  const slashCommands = [
    { label: "/styles", desc: "CSS styling & layout" },
    { label: "/data", desc: "Update widget data" },
    { label: "/config", desc: "Table & widget config" },
    { label: "/help", desc: "Ask for guidance" },
  ] as const;
  if (!groqChatOpen) {
    return null;
  }

  return (
    <div
      className="fixed right-0 top-0 h-full w-80 bg-white border-l border-slate-200 shadow-2xl flex flex-col z-50"
      data-test-id="builder-ai-chat-panel"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <div>
            <p className="text-sm font-semibold">AI Builder Assistant</p>
            {groqChatContext && (
              <p className="text-[10px] opacity-80">
                {groqChatContext.blockType} · {groqChatContext.slotIdx < 0 ? "wrapper" : `col ${groqChatContext.slotIdx + 1}`}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={closeGroqChat}
          className="text-white/70 hover:text-white"
          data-test-id="builder-ai-chat-close-btn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {groqChatContext?.currentCss && (
        <div className="px-3 py-2 bg-slate-900 border-b border-slate-700">
          <p className="text-[10px] text-slate-400 font-mono mb-1">Current styles:</p>
          <p className="text-[10px] text-green-400 font-mono truncate">{groqChatContext.currentCss}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {groqMessages.length === 0 && (
          <div className="text-center text-xs text-slate-400 mt-8">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <p>Ask for styles, data, config, or guidance.</p>
            <p className="mt-1 text-slate-500">Try: &quot;how to align this right?&quot; or &quot;/data change label to Save&quot;</p>
          </div>
        )}
        {groqMessages.map((msg, i) => {
          const isCssLikeAssistantResponse =
            msg.role === "assistant"
            && /(^|;)\s*[a-z-]+\s*:\s*[^;]+;?/i.test(msg.content)
            && !msg.content.toLowerCase().includes("suggested command mode");
          return (
            <div
              key={i}
              className={`text-xs rounded-lg px-3 py-2 whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white ml-4"
                  : isCssLikeAssistantResponse
                    ? "bg-slate-900 text-green-400 font-mono mr-4"
                    : "bg-slate-100 text-slate-700 mr-4"
              }`}
              data-test-id={`builder-ai-chat-msg-${i}`}
            >
              {msg.content}
            </div>
          );
        })}
        {groqChatLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-200 relative">
        <Input
          ref={groqInputRef}
          value={groqInput}
          onChange={(e) => {
            const value = e.target.value;
            setGroqInput(value);
            if (value === "/") {
              setSlashMenuOpen(true);
              setSlashMenuHighlighted(0);
            } else if (!value.startsWith("/") || value.includes(" ")) {
              setSlashMenuOpen(false);
            }
          }}
          onKeyDown={(e) => {
            if (slashMenuOpen) {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSlashMenuHighlighted((prev) => (prev > 0 ? prev - 1 : slashCommands.length - 1));
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSlashMenuHighlighted((prev) => (prev < slashCommands.length - 1 ? prev + 1 : 0));
              } else if (e.key === "Enter") {
                setGroqInput(`${slashCommands[slashMenuHighlighted]?.label ?? "/styles"} `);
                setSlashMenuOpen(false);
                e.preventDefault();
              } else if (e.key === "Escape") {
                setSlashMenuOpen(false);
              }
            } else if (e.key === "Enter" && !e.shiftKey && groqInput.trim()) {
              sendGroqMessage(groqInput);
              setGroqInput("");
            }
          }}
          placeholder="e.g. /styles bg blue, /data change label, /help how to align right?"
          className="flex-1 text-xs h-8"
          data-test-id="builder-ai-chat-input"
          autoFocus
        />

        {slashMenuOpen && (
          <div className="absolute bottom-10 left-3 bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-48">
            {slashCommands.map((cmd, idx) => (
              <button
                key={cmd.label}
                onClick={() => {
                  setGroqInput(`${cmd.label} `);
                  setSlashMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${idx === slashMenuHighlighted ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-50 text-slate-700"}`}
              >
                <span className="font-mono font-bold">{cmd.label}</span>
                <span className="text-slate-500 ml-2">{cmd.desc}</span>
              </button>
            ))}
          </div>
        )}
        <Button
          size="sm"
          className="h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700"
          disabled={!groqInput.trim() || groqChatLoading}
          onClick={() => {
            sendGroqMessage(groqInput);
            setGroqInput("");
          }}
          data-test-id="builder-ai-chat-send-btn"
        >
          {groqChatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );
}
