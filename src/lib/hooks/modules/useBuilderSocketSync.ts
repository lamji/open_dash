import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { BUILDER_CACHE_INVALIDATE_EVENT } from "@/domain/cache/types";
import { bootstrapSocketServer } from "@/lib/api/builder-runtime";

export function useBuilderSocketSync({
  projectId,
  queryClient,
}: {
  projectId: string;
  queryClient: QueryClient;
}) {
  useEffect(() => {
    console.log(`Debug flow: useBuilderSocketSync effect fired with`, { projectId });
    const currentNavItemsQueryKey = ["builder-nav-items", projectId] as const;
    const currentWidgetTemplatesQueryKey = ["builder-widget-templates"] as const;
    let isDisposed = false;
    let socket: ReturnType<typeof io> | null = null;

    const initializeBuilderSocket = async () => {
      console.log(`Debug flow: initializeBuilderSocket fired with`, { projectId });
      try {
        await bootstrapSocketServer();
      } catch (err) {
        console.error(`Debug flow: initializeBuilderSocket bootstrap failed`, err);
        return;
      }

      if (isDisposed) {
        console.log(`Debug flow: initializeBuilderSocket skipped`, {
          projectId,
          reason: "effect disposed before connect",
        });
        return;
      }

      socket = io({
        path: "/api/socket/io",
        addTrailingSlash: false,
      });

      socket.on("connect", () => {
        console.log(`Debug flow: useBuilder socket connect fired with`, {
          projectId,
          socketId: socket?.id,
        });
      });

      socket.on("connect_error", (err) => {
        console.error(`Debug flow: useBuilder socket connect_error fired with`, {
          projectId,
          message: err.message,
        });
      });

      socket.on(BUILDER_CACHE_INVALIDATE_EVENT, (event: { key?: string }) => {
        console.log(`Debug flow: useBuilder socket invalidate fired with`, { event, projectId });
        if (event.key === `sidebar:${projectId}`) {
          void queryClient.invalidateQueries({ queryKey: currentNavItemsQueryKey });
        }
        if (event.key === "widgets:all") {
          void queryClient.invalidateQueries({ queryKey: currentWidgetTemplatesQueryKey });
        }
      });
    };

    void initializeBuilderSocket();

    return () => {
      isDisposed = true;
      console.log(`Debug flow: useBuilder socket cleanup fired with`, { projectId });
      socket?.close();
    };
  }, [projectId, queryClient]);
}
