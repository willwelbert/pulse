import { useSyncExternalStore } from "react";
import { assinarRelogio, hoje } from "@/lib/clock";
import type { IsoDate } from "@/lib/pulse/types";

/** The (possibly simulated) current day; null while rendering on the server. */
export function useHoje(): IsoDate | null {
  return useSyncExternalStore(assinarRelogio, hoje, () => null);
}
