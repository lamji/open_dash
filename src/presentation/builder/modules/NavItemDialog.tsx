import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface NavItemDialogProps {
  navItemModalOpen: boolean;
  closeNavItemModal: () => void;
  navItemLabel: string;
  setNavItemLabel: (label: string) => void;
  addingNavItem: boolean;
  handleAddNavItem: () => void;
}

export function NavItemDialog({
  navItemModalOpen,
  closeNavItemModal,
  navItemLabel,
  setNavItemLabel,
  addingNavItem,
  handleAddNavItem,
}: NavItemDialogProps) {
  return (
    <Dialog open={navItemModalOpen} onOpenChange={(o) => { if (!o) { closeNavItemModal(); setNavItemLabel(""); } }}>
      <DialogContent className="max-w-sm bg-white" data-test-id="builder-nav-item-modal">
        <DialogHeader>
          <DialogTitle>Add navigation item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="nav-item-label" data-test-id="builder-nav-item-label">Page name</Label>
            <Input
              id="nav-item-label"
              value={navItemLabel}
              onChange={(e) => setNavItemLabel(e.target.value)}
              placeholder="e.g. Overview"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleAddNavItem(); }}
              data-test-id="builder-nav-item-input"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { closeNavItemModal(); setNavItemLabel(""); }}
              data-test-id="builder-nav-item-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={!navItemLabel.trim() || addingNavItem}
              onClick={handleAddNavItem}
              data-test-id="builder-nav-item-save-btn"
            >
              {addingNavItem ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {addingNavItem ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
