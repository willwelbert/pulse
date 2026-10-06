import { addDays, daysBetween, inicioDaSemana } from "./datas";
import type { CheckIn, IsoDate } from "./types";

/** Check-ins needed in a calendar week (Mon–Sun) to be in rhythm. Dias de descanso count. */
export const META_SEMANAL = 5;

export type DiaDaSemana = { date: IsoDate; checkIn: CheckIn | null };

export type RitmoDaSemana = {
  inicio: IsoDate;
  dias: DiaDaSemana[];
  registrados: number;
  faltam: number;
  atingido: boolean;
  aindaPossivel: boolean;
};

export function ritmoDaSemana(checkIns: CheckIn[], hoje: IsoDate): RitmoDaSemana {
  const inicio = inicioDaSemana(hoje);
  const porData = new Map(checkIns.map((c) => [c.date, c]));
  const dias = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(inicio, i);
    return { date, checkIn: porData.get(date) ?? null };
  });

  const registrados = dias.filter((d) => d.checkIn).length;
  const diasAbertos = dias.filter((d) => !d.checkIn && daysBetween(hoje, d.date) >= 0).length;

  return {
    inicio,
    dias,
    registrados,
    faltam: Math.max(0, META_SEMANAL - registrados),
    atingido: registrados >= META_SEMANAL,
    aindaPossivel: registrados + diasAbertos >= META_SEMANAL,
  };
}

/** Check-in count per week, keyed by the week's Monday. */
export function checkInsPorSemana(checkIns: CheckIn[]): Map<IsoDate, CheckIn[]> {
  const semanas = new Map<IsoDate, CheckIn[]>();
  for (const c of checkIns) {
    const inicio = inicioDaSemana(c.date);
    semanas.set(inicio, [...(semanas.get(inicio) ?? []), c]);
  }
  return semanas;
}

/**
 * Consecutive weeks in rhythm up to now. The current week only counts once it
 * reaches the goal; while still in progress it does not break the streak.
 */
export function semanasSeguidasNoRitmo(checkIns: CheckIn[], hoje: IsoDate): number {
  const semanas = checkInsPorSemana(checkIns);
  const noRitmo = (inicio: IsoDate) => (semanas.get(inicio)?.length ?? 0) >= META_SEMANAL;

  let semana = inicioDaSemana(hoje);
  if (!noRitmo(semana)) semana = addDays(semana, -7);

  let seguidas = 0;
  while (noRitmo(semana)) {
    seguidas++;
    semana = addDays(semana, -7);
  }
  return seguidas;
}
