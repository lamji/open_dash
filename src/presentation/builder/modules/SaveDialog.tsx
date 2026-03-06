import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface SaveDialogProps {
  saveDialogOpen: boolean;
  setSaveDialogOpen: (open: boolean) => void;
  dashboardName: string;
  setDashboardName: (name: string) => void;
  savingLayout: boolean;
  handleSave: () => void;
}

export function SaveDialog({
  saveDialogOpen,
  setSaveDialogOpen,
  dashboardName,
  setDashboardName,
  savingLayout,
  handleSave,
}: SaveDialogProps) {
  return (
    <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
      <DialogContent className="max-w-sm bg-white" data-test-id="builder-save-dialog">
        <DialogHeader>
          <DialogTitle>Save Dashboard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="dashboard-name" data-test-id="builder-save-name-label">Dashboard name</Label>
            <Input
              id="dashboard-name"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="My Dashboard"
              data-test-id="builder-save-name-input"
            />
          </div>
          <Button
            className="w-full"
            disabled={savingLayout}
            onClick={handleSave}
            data-test-id="builder-save-confirm-btn"
          >
            {savingLayout ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {savingLayout ? "Saving…" : "Save & open preview"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
