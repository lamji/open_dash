import { useEffect } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { LayoutBlock } from "@/domain/builder/types";
import type {
  GridPlaygroundDisplay,
  GridPlaygroundDisplayPayload,
  GridPlaygroundHydratePayload,
  GridPlaygroundRootState,
  GridPlaygroundState,
  GridPlaygroundStringPayload,
  GridPlaygroundViewModel,
  GridPlaygroundViewModelProps,
  GridPlaygroundOption,
} from "@/domain/grid-playground/types";

const GRID_PLAYGROUND_INITIAL_STATE: GridPlaygroundState = {
  ratio: "",
  display: "grid",
  justifyContent: "start",
  alignItems: "stretch",
  gap: "16px",
  error: "",
};

export const GRID_PLAYGROUND_JUSTIFY_OPTIONS: readonly GridPlaygroundOption[] = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
  { value: "between", label: "Space Between" },
  { value: "around", label: "Space Around" },
  { value: "evenly", label: "Space Evenly" },
] as const;

export const GRID_PLAYGROUND_ALIGN_OPTIONS: readonly GridPlaygroundOption[] = [
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
  { value: "stretch", label: "Stretch" },
  { value: "baseline", label: "Baseline" },
] as const;

function toEditableRatio(block: LayoutBlock): string {
  console.log("Debug flow: toEditableRatio fired with", { blockId: block.id, gridRatio: block.gridRatio });
  if (!block.gridRatio) return "";
  const parts = block.gridRatio
    .split(" ")
    .map((part) => part.trim().replace("fr", ""))
    .filter((part) => part.length > 0);

  if (parts.length <= block.slots.length) {
    return parts.join("/");
  }

  const normalizedParts = [...parts.slice(0, Math.max(block.slots.length - 1, 0)), parts[parts.length - 1]];
  return normalizedParts.join("/");
}

function normalizeGapValue(rawGap: string): string {
  console.log("Debug flow: normalizeGapValue fired with", { rawGap });
  const trimmedGap = rawGap.trim();
  if (!trimmedGap) return "16px";
  return /^\d+(\.\d+)?$/.test(trimmedGap) ? `${trimmedGap}px` : trimmedGap;
}

function parseGridRatioSpans(block: LayoutBlock): number[] {
  console.log("Debug flow: parseGridRatioSpans fired with", { blockId: block.id, gridRatio: block.gridRatio });
  if (!block.gridRatio) return [];
  const parts = block.gridRatio
    .split(" ")
    .map((part) => Number.parseFloat(part.trim().replace("fr", "")))
    .filter((part) => Number.isFinite(part) && part > 0);

  if (parts.length <= block.slots.length) {
    return parts;
  }

  return [...parts.slice(0, Math.max(block.slots.length - 1, 0)), parts[parts.length - 1]];
}

function getBetweenOffsetColumns(freeColumns: number, slotCount: number, slotIdx: number): number {
  console.log("Debug flow: getBetweenOffsetColumns fired with", { freeColumns, slotCount, slotIdx });
  const gapCount = Math.max(slotCount - 1, 0);
  if (gapCount === 0 || freeColumns === 0 || slotIdx === 0) {
    return 0;
  }

  const baseGap = Math.floor(freeColumns / gapCount);
  const remainder = freeColumns % gapCount;
  let offset = 0;

  for (let gapIdx = 0; gapIdx < slotIdx; gapIdx += 1) {
    offset += baseGap + (gapIdx < remainder ? 1 : 0);
  }

  return offset;
}

export function getGridPlaygroundSlotPlacement(block: LayoutBlock, slotIdx: number): CSSProperties {
  console.log("Debug flow: getGridPlaygroundSlotPlacement fired with", {
    blockId: block.id,
    slotIdx,
    justifyContent: block.justifyContent,
    layoutDisplay: block.layoutDisplay,
  });
  const spans = parseGridRatioSpans(block);
  if (!block.gridRatio || block.layoutDisplay !== "grid" || spans.length !== block.slots.length) {
    return {};
  }

  const span = spans[slotIdx] ?? 1;
  const totalSpan = spans.reduce((sum, current) => sum + current, 0);
  const freeColumns = Math.max(12 - totalSpan, 0);
  const baseOffset =
    block.justifyContent === "end"
      ? freeColumns
      : block.justifyContent === "center"
        ? Math.floor(freeColumns / 2)
        : block.justifyContent === "between"
          ? getBetweenOffsetColumns(freeColumns, spans.length, slotIdx)
          : 0;

  const beforeSpan = spans.slice(0, slotIdx).reduce((sum, current) => sum + current, 0);
  const start = 1 + baseOffset + beforeSpan;
  return { gridColumn: `${start} / span ${span}` };
}

const gridPlaygroundSlice = createSlice({
  name: "gridPlayground",
  initialState: GRID_PLAYGROUND_INITIAL_STATE,
  reducers: {
    hydrateFromBlock: (state, action: PayloadAction<GridPlaygroundHydratePayload>) => {
      console.log("Debug flow: hydrateFromBlock reducer fired with", {
        blockId: action.payload.block.id,
        hasRatio: Boolean(action.payload.block.gridRatio),
      });
      state.ratio = toEditableRatio(action.payload.block);
      state.display = action.payload.block.layoutDisplay ?? "grid";
      state.justifyContent = action.payload.block.justifyContent ?? "start";
      state.alignItems = action.payload.block.alignItems ?? "stretch";
      state.gap = action.payload.block.gap ?? "16px";
      state.error = "";
    },
    setRatio: (state, action: PayloadAction<GridPlaygroundStringPayload>) => {
      console.log("Debug flow: setRatio reducer fired with", { value: action.payload.value });
      state.ratio = action.payload.value;
      state.error = "";
    },
    setDisplay: (state, action: PayloadAction<GridPlaygroundDisplayPayload>) => {
      console.log("Debug flow: setDisplay reducer fired with", { value: action.payload.value });
      state.display = action.payload.value;
    },
    setJustifyContent: (state, action: PayloadAction<GridPlaygroundStringPayload>) => {
      console.log("Debug flow: setJustifyContent reducer fired with", { value: action.payload.value });
      state.justifyContent = action.payload.value;
    },
    setAlignItems: (state, action: PayloadAction<GridPlaygroundStringPayload>) => {
      console.log("Debug flow: setAlignItems reducer fired with", { value: action.payload.value });
      state.alignItems = action.payload.value;
    },
    setGap: (state, action: PayloadAction<GridPlaygroundStringPayload>) => {
      console.log("Debug flow: setGap reducer fired with", { value: action.payload.value });
      state.gap = action.payload.value;
    },
    setError: (state, action: PayloadAction<GridPlaygroundStringPayload>) => {
      console.log("Debug flow: setError reducer fired with", { value: action.payload.value });
      state.error = action.payload.value;
    },
    reset: (state) => {
      console.log("Debug flow: reset reducer fired with", {});
      state.ratio = GRID_PLAYGROUND_INITIAL_STATE.ratio;
      state.display = GRID_PLAYGROUND_INITIAL_STATE.display;
      state.justifyContent = GRID_PLAYGROUND_INITIAL_STATE.justifyContent;
      state.alignItems = GRID_PLAYGROUND_INITIAL_STATE.alignItems;
      state.gap = GRID_PLAYGROUND_INITIAL_STATE.gap;
      state.error = GRID_PLAYGROUND_INITIAL_STATE.error;
    },
  },
});

export function createGridPlaygroundStore() {
  console.log("Debug flow: createGridPlaygroundStore fired with", {});
  return configureStore({
    reducer: {
      gridPlayground: gridPlaygroundSlice.reducer,
    },
  });
}

export function useGridPlaygroundViewModel(props: GridPlaygroundViewModelProps): GridPlaygroundViewModel {
  console.log("Debug flow: useGridPlaygroundViewModel fired with", { blockId: props.block?.id ?? null });
  const dispatch = useDispatch();
  const viewState = useSelector((state: GridPlaygroundRootState) => state.gridPlayground);

  useEffect(() => {
    console.log("Debug flow: useGridPlaygroundViewModel hydrate effect fired with", {
      blockId: props.block?.id ?? null,
    });
    if (!props.block) {
      dispatch(gridPlaygroundSlice.actions.reset());
      return;
    }
    dispatch(gridPlaygroundSlice.actions.hydrateFromBlock({ block: props.block }));
  }, [props.block, dispatch]);

  const columnCount = props.block?.slots.length ?? 2;
  const exampleInput = columnCount === 2 ? "2/8" : columnCount === 3 ? "5/2/5" : "4/4/2/2";

  const handleCancel = () => {
    console.log("Debug flow: handleCancel grid playground fired with", { blockId: props.block?.id ?? null });
    dispatch(gridPlaygroundSlice.actions.reset());
    props.onClose();
  };

  const handleApply = () => {
    console.log("Debug flow: handleApply grid playground fired with", {
      blockId: props.block?.id ?? null,
      ratio: viewState.ratio,
      display: viewState.display,
      justifyContent: viewState.justifyContent,
      alignItems: viewState.alignItems,
      gap: viewState.gap,
    });

    if (!props.block) {
      return;
    }

    const parts = viewState.ratio
      .trim()
      .split("/")
      .filter((part) => part.trim());

    if (parts.length !== columnCount) {
      dispatch(
        gridPlaygroundSlice.actions.setError({
          value: `Enter ${columnCount} numbers separated by \"/\" (e.g., ${exampleInput})`,
        }),
      );
      return;
    }

    const numbers = parts.map((part) => Number.parseFloat(part.trim()));
    if (numbers.some((numberValue) => Number.isNaN(numberValue) || numberValue <= 0)) {
      dispatch(gridPlaygroundSlice.actions.setError({ value: "All values must be positive numbers" }));
      return;
    }

    const total = numbers.reduce((sum, current) => sum + current, 0);
    if (total > 12) {
      dispatch(gridPlaygroundSlice.actions.setError({ value: "Sum cannot exceed 12" }));
      return;
    }

    const frValue = numbers.map((numberValue) => `${numberValue}fr`).join(" ");
    props.onApply(props.block.id, {
      ratio: frValue,
      display: viewState.display as GridPlaygroundDisplay,
      justifyContent: viewState.justifyContent,
      alignItems: viewState.alignItems,
      gap: normalizeGapValue(viewState.gap),
    });
    dispatch(gridPlaygroundSlice.actions.reset());
  };

  const handleRatioKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    console.log("Debug flow: handleRatioKeyDown fired with", { key: event.key });
    if (event.key === "Enter") {
      handleApply();
    }
  };

  return {
    ratio: viewState.ratio,
    display: viewState.display,
    justifyContent: viewState.justifyContent,
    alignItems: viewState.alignItems,
    gap: viewState.gap,
    error: viewState.error,
    columnCount,
    exampleInput,
    justifyOptions: GRID_PLAYGROUND_JUSTIFY_OPTIONS,
    alignOptions: GRID_PLAYGROUND_ALIGN_OPTIONS,
    onRatioChange: (value: string) => dispatch(gridPlaygroundSlice.actions.setRatio({ value })),
    onDisplayChange: (value: GridPlaygroundDisplay) => dispatch(gridPlaygroundSlice.actions.setDisplay({ value })),
    onJustifyChange: (value: string) => dispatch(gridPlaygroundSlice.actions.setJustifyContent({ value })),
    onAlignChange: (value: string) => dispatch(gridPlaygroundSlice.actions.setAlignItems({ value })),
    onGapChange: (value: string) => dispatch(gridPlaygroundSlice.actions.setGap({ value })),
    onRatioKeyDown: handleRatioKeyDown,
    onCancel: handleCancel,
    onApplyClick: handleApply,
  };
}
