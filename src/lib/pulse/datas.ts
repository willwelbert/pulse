import type { IsoDate } from "./types";

const DIA_MS = 24 * 60 * 60 * 1000;

// Dates are handled as UTC midnights so day arithmetic never shifts with the local timezone.
function toUtc(date: IsoDate): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function fromUtc(ms: number): IsoDate {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return fromUtc(toUtc(date) + days * DIA_MS);
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtc(to) - toUtc(from)) / DIA_MS);
}

/** Monday of the calendar week containing `date`. */
export function inicioDaSemana(date: IsoDate): IsoDate {
  const diaDaSemana = new Date(toUtc(date)).getUTCDay(); // 0 = Sunday
  return addDays(date, -((diaDaSemana + 6) % 7));
}

/** The `count` days ending at `ultimo`, oldest first. */
export function diasAte(ultimo: IsoDate, count: number): IsoDate[] {
  return Array.from({ length: count }, (_, i) => addDays(ultimo, i - count + 1));
}

export function hojeLocal(now: Date): IsoDate {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
