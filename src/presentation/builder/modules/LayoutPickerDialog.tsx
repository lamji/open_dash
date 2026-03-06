import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LAYOUT_OPTIONS } from "../builder.constants";
import { DASHBOARD_TEMPLATES, type DashboardTemplate } from "@/lib/dashboard-templates";
import { LayoutVisual, TemplateSkeleton } from "./layoutVisuals";
import type { LayoutType } from "@/domain/builder/types";

interface LayoutPickerDialogProps {
  showLayoutPicker: boolean;
  closeLayoutPicker: () => void;
  addBlock: (type: LayoutType) => void;
  applyTemplate: (template: DashboardTemplate) => void;
}

export function LayoutPickerDialog({
  showLayoutPicker,
  closeLayoutPicker,
  addBlock,
  applyTemplate,
}: LayoutPickerDialogProps) {
  return (
    <Dialog open={showLayoutPicker} onOpenChange={closeLayoutPicker}>
      <DialogContent className="max-w-3xl bg-white" data-test-id="builder-layout-picker-modal">
        <DialogHeader>
          <DialogTitle>Choose a layout</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-2" data-test-id="builder-layout-tabs">
            <TabsTrigger value="basic" data-test-id="builder-layout-tab-basic">Basic Layouts</TabsTrigger>
            <TabsTrigger value="templates" data-test-id="builder-layout-tab-templates">Dashboard Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="mt-4" data-test-id="builder-layout-basic-content">
            <div className="grid grid-cols-2 gap-3">
              {LAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => addBlock(opt.type)}
                  className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                  data-test-id={`builder-layout-option-${opt.type}`}
                >
                  <LayoutVisual cols={opt.cols} />
                  <p className="text-sm font-semibold text-slate-700 mt-3 group-hover:text-blue-700">{opt.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{opt.cols} {opt.cols === 1 ? "slot" : "slots"}</p>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-4" data-test-id="builder-layout-templates-content">
            <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {DASHBOARD_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="p-4 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                  data-test-id={`builder-template-${template.id}`}
                >
                  <div className="mb-3 p-3 bg-white rounded-lg border border-slate-200">
                    <TemplateSkeleton templateId={template.id} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{template.name}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{template.description}</p>
                    <Badge variant="secondary" className="text-[10px] mt-2">{template.category}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
