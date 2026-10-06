import { pressaoAlta } from "./acolhimento";
import { diasAte } from "./datas";
import type { CheckIn, IsoDate } from "./types";

export type EstadoDoDia = "vazio" | "comum" | "tenso" | "descanso";

export function estadoDoDia(checkIn: CheckIn | null): EstadoDoDia {
  if (!checkIn) return "vazio";
  if (checkIn.tipo === "descanso") return "descanso";
  return pressaoAlta(checkIn) ? "tenso" : "comum";
}

export type Batimento = { date: IsoDate; estado: EstadoDoDia };

export function linhaDePulso(checkIns: CheckIn[], hoje: IsoDate, dias: number): Batimento[] {
  const porData = new Map(checkIns.map((c) => [c.date, c]));
  return diasAte(hoje, dias).map((date) => ({
    date,
    estado: estadoDoDia(porData.get(date) ?? null),
  }));
}
