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
        className="max-w-2xl overflow-hidden border border-slate-200 bg-white p-0 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] [&_[data-slot=dialog-close]]:text-slate-500 [&_[data-slot=dialog-close]]:hover:text-slate-800"
        data-test-id="builder-css-editor-modal"
      >
        <DialogTitle className="sr-only">Edit Styles</DialogTitle>
        <div className="flex items-center gap-0 border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]" data-test-id="builder-css-editor-titlebar">
          <div className="flex items-center gap-1.5 border-r border-slate-200 bg-slate-50 px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <span className="px-4 py-3 text-xs font-mono text-slate-500">
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
          <TabsList className="w-full justify-start rounded-none border-b border-slate-200 bg-slate-50 px-2 pt-1" data-test-id="builder-code-editor-tablist">
            <TabsTrigger
              value="css"
              className="rounded-t-xl px-3 py-1.5 text-xs text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-800"
              data-test-id="builder-tab-css"
            >
              CSS
            </TabsTrigger>
            {cssEditorState?.widgetData && Object.keys(cssEditorState.widgetData).length > 0 && (
              <>
                <TabsTrigger
                  value="data"
                  className="rounded-t-xl px-3 py-1.5 text-xs text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-800"
                  data-test-id="builder-tab-data"
                >
                  Data
                </TabsTrigger>
                <TabsTrigger
                  value="function"
                  className="rounded-t-xl px-3 py-1.5 text-xs text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-800"
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
              className="h-56 w-full resize-none border-0 bg-white px-4 py-4 font-mono text-sm text-slate-700 outline-none placeholder:text-slate-300"
              style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
              data-test-id="builder-css-editor-textarea"
            />
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-[10px] font-mono text-slate-400">CSS • Plain declarations only (no selectors)</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={closeCssEditor} className="text-slate-500 hover:text-slate-800" data-test-id="builder-css-editor-cancel-btn">Cancel</Button>
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
              className="h-56 w-full resize-none border-0 bg-white px-4 py-4 font-mono text-sm text-sky-700 outline-none placeholder:text-slate-300"
              style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
              data-test-id="builder-data-editor-textarea"
            />
            {dataJsonError && (
              <div className="border-t border-rose-200 bg-rose-50 px-4 py-1.5" data-test-id="builder-data-json-error">
                <span className="text-[10px] font-mono text-rose-600">{dataJsonError}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-[10px] font-mono text-slate-400">JSON • Widget data object</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={closeCssEditor} className="text-slate-500 hover:text-slate-800" data-test-id="builder-data-editor-cancel-btn">Cancel</Button>
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
              className="h-56 w-full resize-none border-0 bg-white px-4 py-4 font-mono text-sm text-amber-700 outline-none placeholder:text-slate-300"
              style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
              data-test-id="builder-function-editor-textarea"
            />
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-[10px] font-mono text-slate-400">JavaScript • Widget function code</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={closeCssEditor} className="text-slate-500 hover:text-slate-800" data-test-id="builder-function-editor-cancel-btn">Cancel</Button>
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
      className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-slate-200 bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)]"
      data-test-id="builder-ai-chat-panel"
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">AI Assistant</p>
            {groqChatContext && (
              <p className="text-[10px] text-slate-500">
                {groqChatContext.blockType} · {groqChatContext.slotIdx < 0 ? "wrapper" : `col ${groqChatContext.slotIdx + 1}`}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={closeGroqChat}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          data-test-id="builder-ai-chat-close-btn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {groqChatContext?.currentCss && (
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-3">
          <p className="mb-1 text-[10px] font-mono text-slate-400">Current styles:</p>
          <p className="truncate rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-mono text-slate-600">{groqChatContext.currentCss}</p>
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {groqMessages.length === 0 && (
          <div className="mt-8 text-center text-xs text-slate-400">
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-blue-500" />
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
              className={`whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs ${
                msg.role === "user"
                  ? "ml-4 bg-blue-600 text-white"
                  : isCssLikeAssistantResponse
                    ? "mr-4 border border-slate-200 bg-slate-900 font-mono text-green-400"
                    : "mr-4 border border-slate-200 bg-slate-50 text-slate-700"
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

      <div className="relative flex items-center gap-2 border-t border-slate-200 bg-white px-3 py-3">
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
          className="h-10 flex-1 rounded-full border-slate-200 bg-slate-50 px-4 text-xs"
          data-test-id="builder-ai-chat-input"
          autoFocus
        />

        {slashMenuOpen && (
          <div className="absolute bottom-12 left-3 z-50 w-48 rounded-2xl border border-slate-200 bg-white p-1 shadow-lg">
            {slashCommands.map((cmd, idx) => (
              <button
                key={cmd.label}
                onClick={() => {
                  setGroqInput(`${cmd.label} `);
                  setSlashMenuOpen(false);
                }}
                className={`w-full rounded-xl px-3 py-2 text-left text-xs transition-colors ${idx === slashMenuHighlighted ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
                data-test-id={`builder-ai-chat-slash-${cmd.label.replace("/", "")}`}
              >
                <span className="font-mono font-bold">{cmd.label}</span>
                <span className="text-slate-500 ml-2">{cmd.desc}</span>
              </button>
            ))}
          </div>
        )}
        <Button
          size="sm"
          className="h-10 w-10 rounded-full bg-blue-600 p-0 hover:bg-blue-700"
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
