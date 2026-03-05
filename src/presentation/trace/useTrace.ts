import { useState, useCallback } from 'react';
import type { DebugFlowContext, DebugLog, DebugStep, DebugLevel } from '@/domain/trace/types';

export function useTrace() {
  const [logs, setLogs] = useState<Map<string, DebugLog>>(new Map());
  const [activeFlow, setActiveFlow] = useState<DebugFlowContext | null>(null);

  const startFlow = useCallback((context: Partial<DebugFlowContext> = {}) => {
    const flow: DebugFlowContext = {
      flowId: crypto.randomUUID(),
      projectId: context.projectId,
      userId: context.userId,
      sessionId: context.sessionId,
    };

    const log: DebugLog = {
      steps: [],
      startTime: new Date().toISOString(),
      flowId: flow.flowId,
    };

    setLogs(prev => new Map(prev).set(flow.flowId, log));
    setActiveFlow(flow);

    console.log("Debug flow", {
      flowId: flow.flowId,
      step: "flow_started",
      timestamp: log.startTime,
      data: { projectId: flow.projectId, userId: flow.userId },
    });

    return flow;
  }, []);

  const logStep = useCallback((
    flow: DebugFlowContext | null,
    step: string,
    data?: Record<string, unknown>,
    level: DebugLevel = 'info'
  ) => {
    if (!flow) return;

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

    setLogs(prev => {
      const newLogs = new Map(prev);
      const log = newLogs.get(flow.flowId);
      if (log) {
        newLogs.set(flow.flowId, {
          ...log,
          steps: [...log.steps, debugStep],
        });
      }
      return newLogs;
    });
  }, []);

  const endFlow = useCallback((flow: DebugFlowContext | null) => {
    if (!flow) return;

    const endTime = new Date().toISOString();

    console.log("Debug flow", {
      flowId: flow.flowId,
      step: "flow_ended",
      timestamp: endTime,
      data: { duration: endTime },
    });

    setLogs(prev => {
      const newLogs = new Map(prev);
      const log = newLogs.get(flow.flowId);
      if (log) {
        newLogs.set(flow.flowId, {
          ...log,
          endTime,
        });
      }
      return newLogs;
    });

    if (activeFlow?.flowId === flow.flowId) {
      setActiveFlow(null);
    }
  }, [activeFlow]);

  const getFlowLogs = useCallback((flowId: string) => {
    return logs.get(flowId);
  }, [logs]);

  const getAllLogs = useCallback(() => {
    return Array.from(logs.values());
  }, [logs]);

  const clearLogs = useCallback(() => {
    setLogs(new Map());
    setActiveFlow(null);
  }, []);

  return {
    activeFlow,
    logs: Array.from(logs.values()),
    startFlow,
    logStep,
    endFlow,
    getFlowLogs,
    getAllLogs,
    clearLogs,
  };
}

export function createDebugLogger(flow: DebugFlowContext | null) {
  return {
    log: (step: string, data?: Record<string, unknown>) => {
      if (!flow) return;
      console.log("Debug flow", {
        flowId: flow.flowId,
        step,
        timestamp: new Date().toISOString(),
        level: 'info' as const,
        data,
        projectId: flow.projectId,
        userId: flow.userId,
      });
    },
    error: (step: string, error: Error | Record<string, unknown>) => {
      if (!flow) return;
      const errorData = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
      } : error;
      
      console.log("Debug flow", {
        flowId: flow.flowId,
        step,
        timestamp: new Date().toISOString(),
        level: 'error' as const,
        data: errorData,
        projectId: flow.projectId,
        userId: flow.userId,
      });
    },
    warn: (step: string, data?: Record<string, unknown>) => {
      if (!flow) return;
      console.log("Debug flow", {
        flowId: flow.flowId,
        step,
        timestamp: new Date().toISOString(),
        level: 'warn' as const,
        data,
        projectId: flow.projectId,
        userId: flow.userId,
      });
    },
  };
}
