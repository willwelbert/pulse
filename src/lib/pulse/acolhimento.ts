import { naJanela, pulseDiario } from "./score";
import type { CheckIn, IsoDate } from "./types";

export const PRESSAO_ALTA = 4;
const CHECK_INS_SEGUIDOS = 3;
const PULSE_DIARIO_BAIXO = 40;

export function pressaoAlta(checkIn: CheckIn): boolean {
  return (checkIn.emocional?.pressao ?? 0) >= PRESSAO_ALTA;
}

/**
 * On when the 3 most recent check-ins in the window all have high Pressão.
 * Counts check-ins, not calendar days, so an empty day in between does not reset it.
 * A Dia de descanso among them turns it off: resting is the response we want.
 */
export function modoAcolhimento(checkIns: CheckIn[], hoje: IsoDate): boolean {
  const recentes = checkIns
    .filter((c) => naJanela(c, hoje))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, CHECK_INS_SEGUIDOS);

  return (
    recentes.length === CHECK_INS_SEGUIDOS &&
    recentes.every((c) => c.tipo === "regular" && pressaoAlta(c))
  );
}

export type TomDaConclusao = "celebrar" | "acolher" | "descanso";

export function tomDaConclusao(checkIn: CheckIn, acolhimento: boolean): TomDaConclusao {
  if (checkIn.tipo === "descanso") return "descanso";
  if (acolhimento) return "acolher";
  if (checkIn.emocional && pulseDiario(checkIn.emocional) < PULSE_DIARIO_BAIXO) return "acolher";
  return "celebrar";
}
