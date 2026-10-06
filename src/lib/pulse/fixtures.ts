import { addDays } from "./datas";
import type { CheckIn, EstadoEmocional, IsoDate } from "./types";

export const EMOCIONAL_BOM: EstadoEmocional = {
  humor: 5,
  energia: 4,
  motivacao: 5,
  pressao: 2,
  clareza: 4,
};

export const EMOCIONAL_TENSO: EstadoEmocional = {
  humor: 2,
  energia: 2,
  motivacao: 3,
  pressao: 5,
  clareza: 2,
};

export function regular(date: IsoDate, emocional = EMOCIONAL_BOM): CheckIn {
  return { date, tipo: "regular", emocional, operacional: null };
}

export function descanso(date: IsoDate, emocional: EstadoEmocional | null = null): CheckIn {
  return { date, tipo: "descanso", emocional, operacional: null };
}

/** Regular check-ins on `count` consecutive days starting at `from`. */
export function sequencia(from: IsoDate, count: number, emocional = EMOCIONAL_BOM): CheckIn[] {
  return Array.from({ length: count }, (_, i) => regular(addDays(from, i), emocional));
}
