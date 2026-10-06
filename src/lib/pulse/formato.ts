import type { EstadoDoDia } from "./linha";
import type { Dimensao, IsoDate } from "./types";

const emUtc = (date: IsoDate) => new Date(`${date}T00:00:00Z`);

export function formatarData(date: IsoDate): string {
  return emUtc(date).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function formatarDataCurta(date: IsoDate): string {
  return emUtc(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
}

/** Single-letter weekday, Monday first: S T Q Q S S D. */
export function inicialDoDia(date: IsoDate): string {
  return "DSTQQSS"[emUtc(date).getUTCDay()];
}

export const NOMES_DIMENSOES: Record<Dimensao, string> = {
  humor: "Humor",
  energia: "Energia",
  motivacao: "Motivação",
  pressao: "Pressão",
  clareza: "Clareza",
};

const ESCALA = ["Muito baixa", "Baixa", "Média", "Alta", "Muito alta"];

export const ROTULOS_NOTAS: Record<Dimensao, string[]> = {
  humor: ["Muito mal", "Mal", "Ok", "Bem", "Muito bem"],
  energia: ESCALA,
  motivacao: ESCALA,
  pressao: ESCALA,
  clareza: ESCALA,
};

export function rotuloDaNota(dimensao: Dimensao, nota: number | undefined): string {
  return nota ? ROTULOS_NOTAS[dimensao][nota - 1] : "—";
}

export function perguntaDaDimensao(dimensao: Dimensao, ontem: boolean): string {
  const verbo = ontem ? "estava" : "está";
  const quando = ontem ? "ontem" : "hoje";
  const perguntas: Record<Dimensao, string> = {
    humor: `Como ${verbo} seu humor ${quando}?`,
    energia: `Como ${verbo} sua energia ${quando}?`,
    motivacao: `Como ${verbo} sua motivação ${quando}?`,
    pressao: ontem ? "Quão leve foi o dia de ontem?" : "Quão leve foi o dia?",
    clareza: `Como ${verbo} sua clareza mental ${quando}?`,
  };
  return perguntas[dimensao];
}

export const AJUDA_DIMENSOES: Partial<Record<Dimensao, string>> = {
  pressao: "Pressão de prazos, cobranças e entregas. Mais para fora, mais leve: pouca pressão.",
};

export const DESCRICAO_ESTADOS: Record<EstadoDoDia, string> = {
  comum: "Dia comum",
  tenso: "Pressão alta",
  descanso: "Dia de descanso",
  vazio: "Sem registro",
};
