import { addDays, daysBetween } from "./datas";
import { checkInsPorSemana, META_SEMANAL } from "./ritmo";
import type { CheckIn, IsoDate } from "./types";

export const CONQUISTAS = {
  "primeiro-pulso": {
    titulo: "Primeiro pulso",
    descricao: "Seu primeiro check-in.",
  },
  "semana-no-ritmo": {
    titulo: "Semana no ritmo",
    descricao: `${META_SEMANAL} dias registrados numa mesma semana.`,
  },
  "quatro-semanas-no-ritmo": {
    titulo: "4 semanas no ritmo",
    descricao: "Quatro semanas seguidas batendo a meta.",
  },
  "primeiro-descanso": {
    titulo: "Primeiro descanso",
    descricao: "Você declarou um Dia de descanso. Descansar também é constância.",
  },
  "de-volta": {
    titulo: "De volta",
    descricao: "Voltou depois de 7 dias ou mais. Que bom te ver.",
  },
} as const;

export type ConquistaId = keyof typeof CONQUISTAS;

export type ConquistaDesbloqueada = { id: ConquistaId; desbloqueadaEm: IsoDate };

/** Gap of empty days that makes the next check-in a "De volta". */
const AUSENCIA_DE_VOLTA = 7;

/** Rewards registering only — never the ratings themselves (ADR 0001). */
export function conquistasDesbloqueadas(checkIns: CheckIn[]): ConquistaDesbloqueada[] {
  const ordenados = [...checkIns].sort((a, b) => a.date.localeCompare(b.date));
  const desbloqueadas: ConquistaDesbloqueada[] = [];
  const desbloquear = (id: ConquistaId, desbloqueadaEm: IsoDate | undefined) => {
    if (desbloqueadaEm) desbloqueadas.push({ id, desbloqueadaEm });
  };

  desbloquear("primeiro-pulso", ordenados[0]?.date);

  // Date each week reached the goal (its META_SEMANAL-th check-in), in week order.
  const semanasAtingidas = [...checkInsPorSemana(ordenados)]
    .filter(([, daSemana]) => daSemana.length >= META_SEMANAL)
    .map(([inicio, daSemana]) => ({ inicio, atingidaEm: daSemana[META_SEMANAL - 1].date }));
  desbloquear("semana-no-ritmo", semanasAtingidas[0]?.atingidaEm);

  let seguidas = 0;
  let quatroEm: IsoDate | undefined;
  semanasAtingidas.forEach((semana, i) => {
    const anterior = semanasAtingidas[i - 1];
    seguidas = anterior && addDays(anterior.inicio, 7) === semana.inicio ? seguidas + 1 : 1;
    if (seguidas === 4 && !quatroEm) quatroEm = semana.atingidaEm;
  });
  desbloquear("quatro-semanas-no-ritmo", quatroEm);

  desbloquear("primeiro-descanso", ordenados.find((c) => c.tipo === "descanso")?.date);

  const volta = ordenados.find(
    (c, i) => i > 0 && daysBetween(ordenados[i - 1].date, c.date) - 1 >= AUSENCIA_DE_VOLTA,
  );
  desbloquear("de-volta", volta?.date);

  return desbloqueadas.sort((a, b) => a.desbloqueadaEm.localeCompare(b.desbloqueadaEm));
}

export function novasConquistas(antes: CheckIn[], depois: CheckIn[]): ConquistaDesbloqueada[] {
  const jaTinha = new Set(conquistasDesbloqueadas(antes).map((c) => c.id));
  return conquistasDesbloqueadas(depois).filter((c) => !jaTinha.has(c.id));
}
