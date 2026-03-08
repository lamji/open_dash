import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { WidgetPickerCard } from "@/components/widgets/widget-picker-card";
import { WIDGET_CATEGORIES } from "@/presentation/widgets";
import type { WidgetTemplate } from "@/domain/widgets/types";

interface WidgetVariantPickerDialogProps {
  showWidgetVariantPicker: { blockId: string; slotIdx: number; category: string } | null;
  closeWidgetVariantPicker: () => void;
  loadingTemplates: boolean;
  variantTemplates: WidgetTemplate[];
  placeWidget: (blockId: string, slotIdx: number, template: WidgetTemplate) => void;
  setSelectedSlot: (slot: { blockId: string; slotIdx: number } | null) => void;
}

export function WidgetVariantPickerDialog({
  showWidgetVariantPicker,
  closeWidgetVariantPicker,
  loadingTemplates,
  variantTemplates,
  placeWidget,
  setSelectedSlot,
}: WidgetVariantPickerDialogProps) {
  return (
    <Dialog open={!!showWidgetVariantPicker} onOpenChange={closeWidgetVariantPicker}>
      <DialogContent className="flex h-[calc(100vh-2rem)] min-w-[calc(100vw-2rem)] flex-col gap-0 p-0 bg-white overflow-hidden" data-test-id="builder-variant-picker-modal">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white flex-shrink-0">
          <DialogTitle>
            {showWidgetVariantPicker
              ? showWidgetVariantPicker.category === "custom"
                ? "Choose a custom widget"
                : `Choose a ${WIDGET_CATEGORIES.find(c => c.id === showWidgetVariantPicker.category)?.label ?? showWidgetVariantPicker.category} widget`
              : "Choose widget"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {loadingTemplates ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm" data-test-id="builder-variant-loading">Loading widgets…</div>
          ) : variantTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2" data-test-id="builder-variant-empty">
              <p className="text-slate-500 text-sm">
                {showWidgetVariantPicker?.category === "custom"
                  ? "No private custom widgets found for this project."
                  : "No widgets found for this category."}
              </p>
              <Badge variant="secondary">
                {showWidgetVariantPicker?.category === "custom" ? "Create one from the Widgets page" : "Try seeding the DB with widgets"}
              </Badge>
            </div>
          ) : (
            <div className="p-6" data-test-id="builder-variant-grid">
              <WidgetPickerCard
                templates={variantTemplates}
                onSelect={(template) => {
                  if (showWidgetVariantPicker) {
                    placeWidget(showWidgetVariantPicker.blockId, showWidgetVariantPicker.slotIdx, {
                      slug: template.slug,
                      runtimeWidgetId: template.runtimeWidgetId,
                      category: template.category,
                      title: template.title,
                      description: template.description,
                      jsxCode: template.jsxCode,
                      widgetData: template.widgetData,
                    } as WidgetTemplate);
                  }
                  setSelectedSlot(null);
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
