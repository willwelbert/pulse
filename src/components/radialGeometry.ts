import type { Dimensao } from "@/lib/pulse/types";

/** Fan anchored on the bottom-right corner of a 360×360 viewBox. */
export const TAMANHO = 360;
export const CENTRO = { x: TAMANHO, y: TAMANHO };
export const RAIO = 280;
/** Radius of the empty hole around the corner. */
export const FUNDO = 88;
export const NIVEIS = 5;
export const ESPESSURA = (RAIO - FUNDO) / NIVEIS;

/** Bottom (nearest the thumb) to top. */
export const ORDEM_NO_LEQUE: Dimensao[] = ["humor", "energia", "motivacao", "clareza", "pressao"];

const ABERTURA = 90 / ORDEM_NO_LEQUE.length;

export type Fatia = { dimensao: Dimensao; inicio: number; fim: number; meio: number };

/** Angles in SVG degrees: 180 points left (nearest the thumb), 270 points up. */
export const fatias: Fatia[] = ORDEM_NO_LEQUE.map((dimensao, i) => {
  const inicio = 180 + i * ABERTURA;
  return { dimensao, inicio, fim: inicio + ABERTURA, meio: inicio + ABERTURA / 2 };
});

export function ponto(angulo: number, raio: number) {
  const rad = (angulo * Math.PI) / 180;
  return { x: CENTRO.x + raio * Math.cos(rad), y: CENTRO.y + raio * Math.sin(rad) };
}

function setor(inicio: number, fim: number, interno: number, externo: number): string {
  const a = ponto(inicio, externo);
  const b = ponto(fim, externo);
  const c = ponto(fim, interno);
  const d = ponto(inicio, interno);
  return [
    `M${a.x},${a.y}`,
    `A${externo},${externo} 0 0 1 ${b.x},${b.y}`,
    `L${c.x},${c.y}`,
    `A${interno},${interno} 0 0 0 ${d.x},${d.y}`,
    "Z",
  ].join(" ");
}

/** Path of one ring segment (level 1 is the innermost). */
export function caminhoDoAnel(fatia: Fatia, nivel: number): string {
  return setor(fatia.inicio, fatia.fim, FUNDO + (nivel - 1) * ESPESSURA, FUNDO + nivel * ESPESSURA);
}

/** Path of the whole wedge, used for the focus outline. */
export function caminhoDaFatia(fatia: Fatia): string {
  return setor(fatia.inicio, fatia.fim, FUNDO, RAIO);
}

export function nivelPorDistancia(distancia: number): number {
  return Math.min(NIVEIS, Math.max(1, Math.ceil((distancia - FUNDO) / ESPESSURA)));
}

/** Where the label sits: just outside the arc, on the wedge's middle angle. */
export function posicaoDoRotulo(fatia: Fatia) {
  return ponto(fatia.meio, RAIO + 10);
}

/** Centre of a ring segment, for the Pressão micro-captions. */
export function centroDoAnel(fatia: Fatia, nivel: number) {
  return ponto(fatia.meio, FUNDO + (nivel - 0.5) * ESPESSURA);
}

/** Angle of a point around the corner, in the same SVG degrees as the wedges (0–360). */
export function anguloDoPonto(p: { x: number; y: number }): number {
  const graus = (Math.atan2(p.y - CENTRO.y, p.x - CENTRO.x) * 180) / Math.PI;
  return (graus + 360) % 360;
}

/** Wedge at an angle, clamped to the quarter circle. */
export function fatiaNoAngulo(angulo: number): Fatia {
  const preso = Math.min(269.999, Math.max(180, angulo));
  return fatias.find((f) => preso >= f.inicio && preso < f.fim) ?? fatias[fatias.length - 1];
}

/** Wedge and level under a point, or null outside the fan. */
export function alvoNoPonto(p: { x: number; y: number }): { dimensao: Dimensao; nivel: number } | null {
  const distancia = Math.hypot(p.x - CENTRO.x, p.y - CENTRO.y);
  const angulo = anguloDoPonto(p);
  if (distancia > RAIO || angulo < 180 || angulo > 270) return null;
  return { dimensao: fatiaNoAngulo(angulo).dimensao, nivel: nivelPorDistancia(distancia) };
}
