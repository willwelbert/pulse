import { addDays, daysBetween, hojeLocal } from "@/lib/pulse/datas";
import type { IsoDate } from "@/lib/pulse/types";

/**
 * Injectable "today" for the Modo demonstração: the real date shifted by an
 * offset in days, persisted so a reload keeps the simulated day.
 */
const CHAVE = "pulse:demo:offset-dias";
const ouvintes = new Set<() => void>();

function lerOffset(): number {
  try {
    return Number(localStorage.getItem(CHAVE)) || 0;
  } catch {
    return 0;
  }
}

function gravarOffset(dias: number) {
  try {
    localStorage.setItem(CHAVE, String(dias));
  } catch {
    // Without storage the simulated day only lasts until reload.
  }
  ouvintes.forEach((ouvir) => ouvir());
}

export function hojeReal(): IsoDate {
  return hojeLocal(new Date());
}

export function hoje(): IsoDate {
  return addDays(hojeReal(), lerOffset());
}

export function avancarDias(dias: number) {
  gravarOffset(lerOffset() + dias);
}

export function definirHoje(date: IsoDate) {
  gravarOffset(daysBetween(hojeReal(), date));
}

export function resetarRelogio() {
  gravarOffset(0);
}

export function assinarRelogio(ouvir: () => void): () => void {
  ouvintes.add(ouvir);
  return () => ouvintes.delete(ouvir);
}
