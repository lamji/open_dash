import { Plus, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateSectionProps {
  openLayoutPicker: () => void;
  navItems: unknown[];
}

export function EmptyStateSection({ openLayoutPicker, navItems }: EmptyStateSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" data-test-id="builder-empty-state">
      <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-blue-200">
        <LayoutGrid className="w-10 h-10 text-blue-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Your dashboard is empty</h2>
      <p className="text-slate-500 mb-8 max-w-sm text-sm">
        Click <strong>Add Block</strong> to choose a layout, then select an empty slot and pick a widget from the sidebar.
      </p>
      <Button 
        size="lg" 
        onClick={openLayoutPicker} 
        disabled={navItems.length === 0}
        className={navItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
        data-test-id="builder-empty-cta"
      >
        <Plus className="w-5 h-5 mr-2" /> Start building
      </Button>
    </div>
  );
}
