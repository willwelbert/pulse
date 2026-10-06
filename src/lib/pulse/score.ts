import { daysBetween } from "./datas";
import type { CheckIn, EstadoEmocional, IsoDate } from "./types";

/** Days in the Pulse Score window, today included. */
export const JANELA_DIAS = 7;
/** Below this many check-ins the Score is only a retrato inicial. */
export const MINIMO_PARA_SCORE = 3;

/** 0–100 for one check-in: each rating mapped to 0–1, Pressão inverted. */
export function pulseDiario(e: EstadoEmocional): number {
  const soma =
    e.humor - 1 + (e.energia - 1) + (e.motivacao - 1) + (5 - e.pressao) + (e.clareza - 1);
  return Math.round((soma / 20) * 100);
}

export function naJanela(checkIn: CheckIn, hoje: IsoDate): boolean {
  const atras = daysBetween(checkIn.date, hoje);
  return atras >= 0 && atras < JANELA_DIAS;
}

export type PulseScore =
  | { estado: "vazio"; valor: null; diasRegistrados: number }
  | { estado: "retrato-inicial" | "pronto"; valor: number; diasRegistrados: number };

export function pulseScore(checkIns: CheckIn[], hoje: IsoDate): PulseScore {
  const janela = checkIns.filter((c) => naJanela(c, hoje));
  const diarios = janela.flatMap((c) => (c.emocional ? [pulseDiario(c.emocional)] : []));
  const diasRegistrados = janela.length;

  if (diarios.length === 0) return { estado: "vazio", valor: null, diasRegistrados };

  const valor = Math.round(diarios.reduce((a, b) => a + b, 0) / diarios.length);
  const estado = diasRegistrados < MINIMO_PARA_SCORE ? "retrato-inicial" : "pronto";
  return { estado, valor, diasRegistrados };
}

export function rotuloDoScore(valor: number): string {
  if (valor >= 75) return "Bom momento";
  if (valor >= 50) return "Estável";
  return "Pede atenção";
}
