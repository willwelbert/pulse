/** Upper bound for Tempo trabalhado, in minutes. */
export const TEMPO_MAXIMO = 16 * 60;

export const ATALHOS_DE_TEMPO = [-60, -30, 30, 60] as const;

export function ajustarTempo(minutos: number, delta: number): number {
  return Math.min(TEMPO_MAXIMO, Math.max(0, minutos + delta));
}

export function formatarTempo(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0 && m > 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export function formatarAtalho(delta: number): string {
  const sinal = delta > 0 ? "+" : "−";
  const abs = Math.abs(delta);
  return `${sinal}${abs >= 60 ? `${abs / 60}h` : `${abs}min`}`;
}
