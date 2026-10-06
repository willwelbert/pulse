"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { assinarRelogio } from "@/lib/clock";
import { pulseKeys } from "@/hooks/usePulse";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } }));

  // Moving the simulated day changes every answer from the mock API.
  useEffect(
    () => assinarRelogio(() => queryClient.invalidateQueries({ queryKey: pulseKeys.all })),
    [queryClient],
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
