"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    console.log(`Debug flow: QueryProvider createQueryClient fired with`, {});
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          refetchOnWindowFocus: false,
        },
      },
    });
  });

  console.log(`Debug flow: QueryProvider fired with`, {});

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
