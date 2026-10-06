import type { CheckIn } from "@/lib/pulse/types";

/** Mock persistence standing in for the api.added.today database. */
const CHAVE = "pulse:check-ins";

export function lerCheckIns(): CheckIn[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
  } catch {
    return [];
  }
}

export function gravarCheckIns(checkIns: CheckIn[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(checkIns));
  } catch {
    // Storage unavailable (private mode): data lives only for this page view.
  }
}

/** Campanhas ativas come from the Radar, not from the check-in. */
export function campanhasAtivasNoRadar(): number {
  return 2;
}
