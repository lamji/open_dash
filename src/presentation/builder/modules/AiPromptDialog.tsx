import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface AiPromptDialogProps {
  aiPromptModal: { blockId: string; slotIdx: number } | null;
  setAiPromptModal: (modal: { blockId: string; slotIdx: number } | null) => void;
  aiWidgetPrompts: Record<string, string>;
  setAiWidgetPrompts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  aiWidgetLoading: string | null;
  handleGenerateAiWidget: (blockId: string, slotIdx: number) => void;
}

export function AiPromptDialog({
  aiPromptModal,
  setAiPromptModal,
  aiWidgetPrompts,
  setAiWidgetPrompts,
  aiWidgetLoading,
  handleGenerateAiWidget,
}: AiPromptDialogProps) {
  return (
    <Dialog open={!!aiPromptModal} onOpenChange={(o) => { if (!o) setAiPromptModal(null); }}>
      <DialogContent className="max-w-md border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)]">
        <DialogHeader>
          <DialogTitle>Create with AI</DialogTitle>
        </DialogHeader>
        {aiPromptModal && (
          <div className="space-y-3">
            <Input
              value={aiWidgetPrompts[`${aiPromptModal.blockId}-${aiPromptModal.slotIdx}`] ?? ""}
              onChange={(e) => setAiWidgetPrompts((prev) => ({ ...prev, [`${aiPromptModal.blockId}-${aiPromptModal.slotIdx}`]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") { handleGenerateAiWidget(aiPromptModal.blockId, aiPromptModal.slotIdx); setAiPromptModal(null); } }}
              placeholder="Describe a widget…"
              className="border-[var(--border)] bg-[var(--muted)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
              disabled={aiWidgetLoading === `${aiPromptModal.blockId}-${aiPromptModal.slotIdx}`}
              data-test-id={`builder-ai-modal-input-${aiPromptModal.blockId}-${aiPromptModal.slotIdx}`}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setAiPromptModal(null)} data-test-id="builder-ai-modal-cancel">Cancel</Button>
              <Button
                size="sm"
                className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
                disabled={!aiWidgetPrompts[`${aiPromptModal.blockId}-${aiPromptModal.slotIdx}`]?.trim() || aiWidgetLoading === `${aiPromptModal.blockId}-${aiPromptModal.slotIdx}`}
                onClick={() => { handleGenerateAiWidget(aiPromptModal.blockId, aiPromptModal.slotIdx); setAiPromptModal(null); }}
                data-test-id="builder-ai-modal-send"
              >
                {aiWidgetLoading === `${aiPromptModal.blockId}-${aiPromptModal.slotIdx}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
