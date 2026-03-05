'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrace } from '@/presentation/trace/useTrace';
import { Clock, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface TraceDisplayProps {
  className?: string;
}

export function TraceDisplay({ className = '' }: TraceDisplayProps) {
  const { logs, clearLogs } = useTrace();

  const getLevelIcon = (level?: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-3 w-3 text-blue-500" />;
    }
  };

  const getLevelVariant = (level?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warn':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'Active';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = end.getTime() - start.getTime();
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  if (logs.length === 0) {
    return (
      <Card className={`w-full max-w-4xl mx-auto ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Debug Flow Tracer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No debug logs available. Start a flow to see traces.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Debug Flow Tracer
          <Badge variant="outline">{logs.length} flows</Badge>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={clearLogs}
          data-test-id="trace-clear-logs"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {logs.map((log) => (
          <div key={log.flowId} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Flow ID: {log.flowId.slice(0, 8)}</Badge>
                <Badge variant={log.endTime ? "secondary" : "default"}>
                  {log.endTime ? "Completed" : "Active"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Duration: {formatDuration(log.startTime, log.endTime)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(log.startTime).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="space-y-2">
              {log.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded bg-muted/30">
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground font-mono">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {getLevelIcon(step.data?.level as string)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{step.step}</span>
                      <Badge variant={getLevelVariant(typeof step.data?.level === 'string' ? step.data.level : 'info')} className="text-xs">
                        {typeof step.data?.level === 'string' ? step.data.level : 'info'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(step.timestamp).toLocaleTimeString()}</span>
                      {step.error && (
                        <Badge variant="destructive" className="text-xs">
                          Error: {step.error}
                        </Badge>
                      )}
                    </div>
                    
                    {step.data && Object.keys(step.data).length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View Data ({Object.keys(step.data).length} fields)
                        </summary>
                        <pre className="mt-1 p-2 bg-background rounded border overflow-x-auto">
                          {JSON.stringify(step.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default TraceDisplay;
