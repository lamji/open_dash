"use client";

import { useMemo } from "react";
import { Provider } from "react-redux";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  GridPlaygroundDisplay,
  GridPlaygroundModalProps,
  GridPlaygroundPresentationProps,
} from "@/domain/grid-playground/types";
import {
  createGridPlaygroundStore,
  useGridPlaygroundViewModel,
  getGridPlaygroundSlotPlacement,
} from "./useGridPlaygroundViewModel";

function GridPlaygroundPresentation(props: GridPlaygroundPresentationProps) {
  console.log("Debug flow: GridPlaygroundPresentation fired with", {
    open: props.open,
    columnCount: props.columnCount,
    justifyContent: props.justifyContent,
    display: props.display,
  });
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-sm bg-white">
        <DialogHeader>
          <DialogTitle>Custom Column Ratio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Ratio ({props.columnCount} columns)</label>
            <Input
              value={props.ratio}
              onChange={(event) => props.onRatioChange(event.target.value)}
              onKeyDown={props.onRatioKeyDown}
              placeholder={props.exampleInput}
              className="text-sm"
              data-test-id="grid-playground-ratio-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Display</label>
              <select
                value={props.display}
                onChange={(event) => props.onDisplayChange(event.target.value as GridPlaygroundDisplay)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                data-test-id="grid-playground-display-input"
              >
                <option value="grid">Grid</option>
                <option value="flex">Flex</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Gap</label>
              <Input
                value={props.gap}
                onChange={(event) => props.onGapChange(event.target.value)}
                placeholder="16px"
                className="text-sm"
                data-test-id="grid-playground-gap-input"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Justify</label>
              <select
                value={props.justifyContent}
                onChange={(event) => props.onJustifyChange(event.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                data-test-id="grid-playground-justify-input"
              >
                {props.justifyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Align</label>
              <select
                value={props.alignItems}
                onChange={(event) => props.onAlignChange(event.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                data-test-id="grid-playground-align-input"
              >
                {props.alignOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
            <p className="text-xs font-semibold text-slate-700">Instructions:</p>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>
                Enter numbers separated by &quot;/&quot; (e.g., <span className="font-mono font-semibold text-slate-700">{props.exampleInput}</span>)
              </li>
              <li>Each number represents a column span value, and decimals are allowed</li>
              <li>Choose grid or flex, then fine-tune justify, align, and gap</li>
              <li>Grid ratios use a 12-unit minimum canvas, so unused space can remain empty</li>
            </ul>
          </div>

          {props.error && <div className="text-xs text-red-600 font-medium">{props.error}</div>}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={props.onCancel}
              className="flex-1"
              data-test-id="grid-playground-cancel-button"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={props.onApply}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              data-test-id="grid-playground-apply-button"
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GridPlyaGroundInner(props: GridPlaygroundModalProps) {
  console.log("Debug flow: GridPlyaGroundInner fired with", { open: props.open, blockId: props.block?.id ?? null });
  const vm = useGridPlaygroundViewModel({
    block: props.block,
    onClose: props.onClose,
    onApply: props.onApply,
  });

  return (
    <GridPlaygroundPresentation
      open={props.open}
      onOpenChange={(open) => {
        console.log("Debug flow: GridPlyaGroundInner onOpenChange fired with", { open });
        if (!open) {
          vm.onCancel();
        }
      }}
      columnCount={vm.columnCount}
      exampleInput={vm.exampleInput}
      ratio={vm.ratio}
      display={vm.display}
      justifyContent={vm.justifyContent}
      alignItems={vm.alignItems}
      gap={vm.gap}
      error={vm.error}
      justifyOptions={vm.justifyOptions}
      alignOptions={vm.alignOptions}
      onRatioChange={vm.onRatioChange}
      onDisplayChange={vm.onDisplayChange}
      onJustifyChange={vm.onJustifyChange}
      onAlignChange={vm.onAlignChange}
      onGapChange={vm.onGapChange}
      onRatioKeyDown={vm.onRatioKeyDown}
      onCancel={vm.onCancel}
      onApply={vm.onApplyClick}
    />
  );
}

export function GridPlyaGroundModal(props: GridPlaygroundModalProps) {
  console.log("Debug flow: GridPlyaGroundModal fired with", { open: props.open, blockId: props.block?.id ?? null });
  const store = useMemo(() => createGridPlaygroundStore(), []);
  return (
    <Provider store={store}>
      <GridPlyaGroundInner
        open={props.open}
        block={props.block}
        onClose={props.onClose}
        onApply={props.onApply}
      />
    </Provider>
  );
}

export { getGridPlaygroundSlotPlacement };
