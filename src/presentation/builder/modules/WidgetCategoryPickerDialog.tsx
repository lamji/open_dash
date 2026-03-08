import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { WidgetTemplate } from "@/domain/widgets/types";
import { SIDEBAR_CATEGORIES } from "../builder.constants";

interface WidgetCategoryPickerDialogProps {
  widgetCategoryModalOpen: boolean;
  closeWidgetCategoryModal: () => void;
  setSelectedSlot: (slot: { blockId: string; slotIdx: number } | null) => void;
  widgetTemplates: WidgetTemplate[];
  customWidgetCount: number;
  loadingTemplates: boolean;
  handleCategoryClick: (categoryId: string) => void;
}

export function WidgetCategoryPickerDialog({
  widgetCategoryModalOpen,
  closeWidgetCategoryModal,
  setSelectedSlot,
  widgetTemplates,
  customWidgetCount,
  loadingTemplates,
  handleCategoryClick,
}: WidgetCategoryPickerDialogProps) {
  return (
    <Dialog open={widgetCategoryModalOpen} onOpenChange={(o) => { if (!o) { closeWidgetCategoryModal(); setSelectedSlot(null); } }}>
      <DialogContent className="max-w-sm bg-white" data-test-id="builder-category-picker-modal">
        <DialogHeader>
          <DialogTitle>Select a widget category</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 mt-2" data-test-id="builder-category-list">
          {SIDEBAR_CATEGORIES.map((cat) => {
            const count = widgetTemplates.filter((w) => w.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                data-test-id={`builder-category-option-${cat.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${cat.color}`} />
                  <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                </div>
                {!loadingTemplates && count > 0 && (
                  <span className="text-xs text-slate-400">{count} widgets</span>
                )}
              </button>
            );
          })}
          <div className="mt-3 border-t border-slate-200 pt-3">
            <button
              onClick={() => handleCategoryClick("custom")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
              data-test-id="builder-category-option-custom"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-cyan-500" />
                <span className="text-sm font-medium text-slate-700">Custom Widgets</span>
              </div>
              {!loadingTemplates && (
                <span className="text-xs text-slate-400">{customWidgetCount} widgets</span>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
