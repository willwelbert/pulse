import { useSyncExternalStore } from "react";
import { assinarInstalacao, instalacao, type Instalacao } from "@/lib/instalacao";

/** Whether Pulse is on the home screen, or how to put it there; null while rendering on the server. */
export function useInstalacao(): Instalacao | null {
  return useSyncExternalStore(assinarInstalacao, instalacao, () => null);
}
