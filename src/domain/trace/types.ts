export interface DebugStep {
  step: string;
  timestamp: string;
  data?: Record<string, unknown>;
  error?: string;
}

export interface DebugLog {
  steps: DebugStep[];
  startTime: string;
  endTime?: string;
  flowId: string;
}

export interface DebugFlowContext {
  flowId: string;
  projectId?: string;
  userId?: string;
  sessionId?: string;
}

export type DebugLevel = 'info' | 'warn' | 'error' | 'debug';

export function createDebugFlow(context: Partial<DebugFlowContext> = {}): DebugFlowContext {
  return {
    flowId: crypto.randomUUID(),
    projectId: context.projectId,
    userId: context.userId,
    sessionId: context.sessionId,
  };
}

export function logDebugStep(
  flow: DebugFlowContext,
  step: string,
  data?: Record<string, unknown>,
  level: DebugLevel = 'info'
): void {
  const debugStep: DebugStep = {
    step,
    timestamp: new Date().toISOString(),
    data,
  };

  if (level === 'error' && data instanceof Error) {
    debugStep.error = data.message;
    debugStep.data = { stack: data.stack, ...data };
  }

  console.log("Debug flow", {
    flowId: flow.flowId,
    step,
    timestamp: debugStep.timestamp,
    level,
    data: debugStep.data,
    projectId: flow.projectId,
    userId: flow.userId,
  });
}
