import type { Dimensao } from "./types";

/**
 * Pressão is stored as answered (higher is worse), but every scale-shaped
 * visual shows it inverted so that further out / higher is always better.
 */
export function nivelVisual(dimensao: Dimensao, nota: number): number {
  return dimensao === "pressao" ? 6 - nota : nota;
}

export function notaDoNivel(dimensao: Dimensao, nivel: number): number {
  return dimensao === "pressao" ? 6 - nivel : nivel;
}
