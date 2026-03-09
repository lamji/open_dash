"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type {
  LoginFlowChartProps,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeData,
} from "@/domain/internal-docs/types";

const FLOW_OPTIONS = {
  attributionPosition: "bottom-left" as const,
  edgesFocusable: false,
  elementsSelectable: false,
  fitView: true,
  fitViewOptions: { maxZoom: 1, padding: 0.16 },
  nodesConnectable: false,
  nodesDraggable: false,
  nodesFocusable: false,
  panOnDrag: true,
  proOptions: { hideAttribution: true },
  zoomOnDoubleClick: true,
  zoomOnPinch: true,
  zoomOnScroll: true,
};

const ACCENT_STYLES: Record<NonNullable<WorkflowNodeData["accent"]>, string> = {
  cyan: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  emerald: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  slate: "border-slate-400/40 bg-slate-400/10 text-slate-200",
  violet: "border-violet-400/40 bg-violet-400/10 text-violet-200",
};

function WorkflowCardNode({ data }: NodeProps<WorkflowNode>) {
  const accent = data.accent ?? "cyan";

  return (
    <div className="relative w-[360px] rounded-[24px] border border-emerald-400/70 bg-[#f6f7f8] shadow-[0_18px_48px_rgba(0,0,0,0.16)]">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-[3px] !border-emerald-400 !bg-white"
      />

      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {data.status ?? "Step"}
          </p>
          <h5 className="mt-1 text-[22px] font-semibold tracking-tight text-slate-900">
            {data.title}
          </h5>
        </div>
        {data.chip ? (
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${ACCENT_STYLES[accent]}`}
          >
            {data.chip}
          </span>
        ) : null}
      </div>

      <div className="px-5 py-4 text-[15px] leading-7 text-slate-500">
        {data.body}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-[3px] !border-emerald-400 !bg-white"
      />
    </div>
  );
}

function withArrow(edge: WorkflowEdge): WorkflowEdge {
  return {
    ...edge,
    animated: false,
    labelStyle: {
      fill: "#0f172a",
      fontSize: 11,
      fontWeight: 600,
    },
    labelBgPadding: [10, 4],
    labelBgBorderRadius: 999,
    labelBgStyle: {
      fill: "#dcfce7",
      stroke: "#86efac",
      strokeWidth: 1,
    },
    markerEnd: {
      color: "#34d399",
      height: 18,
      type: MarkerType.ArrowClosed,
      width: 18,
    },
    style: {
      stroke: edge.label ? "#94a3b8" : "#34d399",
      strokeWidth: 2,
      ...(edge.style ?? {}),
    },
    type: "smoothstep",
  };
}

function withNodeStyle(node: WorkflowNode): WorkflowNode {
  return {
    ...node,
    sourcePosition: node.sourcePosition ?? Position.Bottom,
    targetPosition: node.targetPosition ?? Position.Top,
  };
}

export function LoginFlowChart({
  dataTestId,
  edges,
  nodes,
  title,
}: LoginFlowChartProps) {
  const nodeTypes = {
    workflowCard: WorkflowCardNode,
  };

  if (process.env.NODE_ENV !== "production") {
    console.debug("Debug flow: LoginFlowChart fired", {
      edgeCount: edges.length,
      nodeCount: nodes.length,
      title,
    });
  }

  return (
    <div
      className="rounded-3xl border border-white/[0.06] bg-[#0b0f17] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
      data-test-id={dataTestId}
    >
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-zinc-100">{title}</h4>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Workflow View
        </span>
      </div>

      <div className="h-[1180px] overflow-hidden rounded-[28px] border border-white/[0.05] bg-[#f3f4f6]">
        <ReactFlow
          {...FLOW_OPTIONS}
          defaultEdgeOptions={{ type: "smoothstep" }}
          edges={edges.map(withArrow)}
          nodeTypes={nodeTypes}
          nodes={nodes.map(withNodeStyle)}
        >
          <Background
            color="rgba(15,23,42,0.14)"
            gap={24}
            size={1.5}
            variant={BackgroundVariant.Dots}
          />
          <Controls
            className="[&>button]:border-slate-200 [&>button]:bg-white [&>button]:text-slate-700"
            position="bottom-right"
            showFitView
            showInteractive={false}
            showZoom
          />
        </ReactFlow>
      </div>
    </div>
  );
}
