import type { KeyboardEvent } from "react";
import type { LayoutBlock } from "@/domain/builder/types";

export type GridPlaygroundDisplay = "grid" | "flex";

export type GridPlaygroundOption = {
  value: string;
  label: string;
};

export type GridPlaygroundApplySettings = {
  ratio: string;
  display: GridPlaygroundDisplay;
  justifyContent: string;
  alignItems: string;
  gap: string;
};

export type GridPlaygroundState = {
  ratio: string;
  display: GridPlaygroundDisplay;
  justifyContent: string;
  alignItems: string;
  gap: string;
  error: string;
};

export type GridPlaygroundRootState = {
  gridPlayground: GridPlaygroundState;
};

export type GridPlaygroundStringPayload = {
  value: string;
};

export type GridPlaygroundDisplayPayload = {
  value: GridPlaygroundDisplay;
};

export type GridPlaygroundHydratePayload = {
  block: LayoutBlock;
};

export type GridPlaygroundModalProps = {
  open: boolean;
  block: LayoutBlock | null;
  onClose: () => void;
  onApply: (blockId: string, settings: GridPlaygroundApplySettings) => void;
};

export type GridPlaygroundViewModelProps = {
  block: LayoutBlock | null;
  onClose: () => void;
  onApply: (blockId: string, settings: GridPlaygroundApplySettings) => void;
};

export type GridPlaygroundPresentationProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnCount: number;
  exampleInput: string;
  ratio: string;
  display: GridPlaygroundDisplay;
  justifyContent: string;
  alignItems: string;
  gap: string;
  error: string;
  justifyOptions: readonly GridPlaygroundOption[];
  alignOptions: readonly GridPlaygroundOption[];
  onRatioChange: (value: string) => void;
  onDisplayChange: (value: GridPlaygroundDisplay) => void;
  onJustifyChange: (value: string) => void;
  onAlignChange: (value: string) => void;
  onGapChange: (value: string) => void;
  onRatioKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onApply: () => void;
};

export type GridPlaygroundViewModel = {
  ratio: string;
  display: GridPlaygroundDisplay;
  justifyContent: string;
  alignItems: string;
  gap: string;
  error: string;
  columnCount: number;
  exampleInput: string;
  justifyOptions: readonly GridPlaygroundOption[];
  alignOptions: readonly GridPlaygroundOption[];
  onRatioChange: (value: string) => void;
  onDisplayChange: (value: GridPlaygroundDisplay) => void;
  onJustifyChange: (value: string) => void;
  onAlignChange: (value: string) => void;
  onGapChange: (value: string) => void;
  onRatioKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onApplyClick: () => void;
};
