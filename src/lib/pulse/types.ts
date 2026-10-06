/** Calendar day as `YYYY-MM-DD`. */
export type IsoDate = string;

export const DIMENSOES = ["humor", "energia", "motivacao", "pressao", "clareza"] as const;
export type Dimensao = (typeof DIMENSOES)[number];

/** Each dimension is rated 1–5. Pressão is the only one where higher is worse. */
export type EstadoEmocional = Record<Dimensao, number>;

export type IndicadoresOperacionais = {
  conteudos: number;
  reunioes: number;
  minutosTrabalhados: number;
};

export type TipoCheckIn = "regular" | "descanso";

export type CheckIn = {
  date: IsoDate;
  tipo: TipoCheckIn;
  /** Required for a regular check-in, optional on a Dia de descanso. */
  emocional: EstadoEmocional | null;
  operacional: IndicadoresOperacionais | null;
};
