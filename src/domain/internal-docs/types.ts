import type { Edge, Node } from "@xyflow/react";

export interface InternalDocChild {
  anchor: string;
  id: string;
  title: string;
}

export interface InternalDocSection {
  children: InternalDocChild[];
  icon: string;
  id: string;
  title: string;
}

export interface WorkflowNodeData extends Record<string, unknown> {
  accent?: "cyan" | "emerald" | "slate" | "violet";
  body: string;
  chip?: string;
  status?: string;
  title: string;
}

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export interface InternalDocFlowStep {
  id: string;
  text: string;
}

export interface InternalDocFlow {
  anchor: string;
  chartTestId: string;
  chartTitle: string;
  description: string;
  edges: WorkflowEdge[];
  headingTestId: string;
  id: string;
  navTitle: string;
  nodes: WorkflowNode[];
  steps: InternalDocFlowStep[];
  title: string;
}

export interface InternalDocOverviewPoint {
  id: string;
  label: string;
  text: string;
}

export interface InternalDocInfoCard {
  bullets: string[];
  id: string;
  title: string;
}

export interface InternalDocSourceItem {
  id: string;
  text: string;
}

export interface LoginFlowChartProps {
  dataTestId: string;
  edges: WorkflowEdge[];
  nodes: WorkflowNode[];
  title: string;
}
