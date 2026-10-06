/**
 * Haptic feedback on Android, through navigator.vibrate.
 *
 * No iOS browser implements navigator.vibrate (they are all WebKit, Chrome
 * included). There, haptics come from <HapticSwitch>: iOS 18+ plays its
 * system haptic only when a real tap toggles a switch, so it has to sit under
 * the finger. Calling these on iPhone is a harmless no-op.
 */
function vibrar(padrao: number | number[]) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(padrao);
}

/** One light tick: a rating changed on the fan. */
export function tique() {
  vibrar(8);
}

/** "Tum-tum": one heartbeat while holding the Pulse button. */
export function batimento() {
  vibrar([18, 110, 26]);
}

/** The fan opened or a check-in was saved. */
export function sucesso() {
  vibrar([30, 60, 30]);
}
