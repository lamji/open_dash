import { Server as SocketIOServer } from "socket.io";
import { BUILDER_CACHE_INVALIDATE_EVENT } from "@/domain/cache/types";

declare global {
  var __openDashSocketServer: SocketIOServer | undefined;
}

export function registerSocketServer(io: SocketIOServer): void {
  console.log(`Debug flow: registerSocketServer fired with`, { hasServer: !!io });
  global.__openDashSocketServer = io;
}

export function getSocketServer(): SocketIOServer | undefined {
  console.log(`Debug flow: getSocketServer fired with`, { hasServer: !!global.__openDashSocketServer });
  return global.__openDashSocketServer;
}

export function emitBuilderCacheInvalidation(key: string): void {
  console.log(`Debug flow: emitBuilderCacheInvalidation fired with`, { key });
  const io = getSocketServer();
  if (!io) {
    console.log(`Debug flow: emitBuilderCacheInvalidation skipped`, { key, reason: "socket server not initialized" });
    return;
  }
  io.emit(BUILDER_CACHE_INVALIDATE_EVENT, {
    key,
    timestamp: new Date().toISOString(),
  });
}
