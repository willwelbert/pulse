import { cn } from "@/lib/utils";
import type { Batimento, EstadoDoDia } from "@/lib/pulse/linha";
import { DESCRICAO_ESTADOS, formatarData } from "@/lib/pulse/formato";

const LARGURA_DIA = 40;
const ALTURA = 84;
const BASE = 46;

/** Beat shapes as [dx, dy] from the baseline; dy is scaled by the rhythm amplitude. */
const FORMAS: Record<Exclude<EstadoDoDia, "descanso" | "vazio">, [number, number][]> = {
  comum: [[0, 0], [10, 0], [13, -4], [16, 0], [19, 0], [21, 5], [24, -26], [27, 9], [29, 0], [40, 0]],
  tenso: [
    [0, 0], [5, 0], [7, -14], [9, 8], [11, -22], [14, 12], [16, -28],
    [19, 10], [21, -12], [23, 6], [26, -18], [29, 9], [31, 0], [40, 0],
  ],
};

const CORES: Record<EstadoDoDia, string> = {
  comum: "stroke-pulse-comum",
  tenso: "stroke-pulse-tenso",
  descanso: "stroke-pulse-descanso",
  vazio: "stroke-pulse-vazio",
};

function caminho(estado: EstadoDoDia, x: number, amplitude: number): string {
  if (estado === "vazio") return `M${x},${BASE} h${LARGURA_DIA}`;
  // A calm, low wave: rest is drawn as intentional, not as a gap.
  if (estado === "descanso") return `M${x},${BASE} q10,-7 20,0 t20,0`;
  return FORMAS[estado]
    .map(([dx, dy], i) => `${i === 0 ? "M" : "L"}${x + dx},${BASE + dy * amplitude}`)
    .join(" ");
}

type Props = {
  batimentos: Batimento[];
  /** Consecutive weeks in rhythm: the line grows stronger with them. */
  semanasSeguidas: number;
  animarUltimo?: boolean;
  className?: string;
};

export function PulseLine({ batimentos, semanasSeguidas, animarUltimo = false, className }: Props) {
  const amplitude = 1 + Math.min(semanasSeguidas, 4) * 0.1;
  const largura = batimentos.length * LARGURA_DIA;
  const ultimo = batimentos.length - 1;
  const registrados = batimentos.filter((b) => b.estado !== "vazio").length;

  return (
    <figure className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${largura} ${ALTURA}`}
        preserveAspectRatio="none"
        className="h-21 w-full overflow-visible"
        role="img"
        aria-label={`Linha de pulso: ${registrados} de ${batimentos.length} dias registrados`}
      >
        {batimentos.map((b, i) => (
          <path
            key={b.date}
            d={caminho(b.estado, i * LARGURA_DIA, amplitude)}
            pathLength={b.estado === "vazio" ? undefined : 1}
            vectorEffect="non-scaling-stroke"
            fill="none"
            strokeWidth={b.estado === "vazio" ? 1.5 : 2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={b.estado === "vazio" ? "3 4" : undefined}
            className={cn(
              CORES[b.estado],
              animarUltimo && i === ultimo && b.estado !== "vazio" && "animate-desenhar",
            )}
          />
        ))}
      </svg>
      <figcaption className="sr-only">
        <ul>
          {batimentos.map((b) => (
            <li key={b.date}>
              {formatarData(b.date)}: {DESCRICAO_ESTADOS[b.estado]}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

export function PulseLegend() {
  const estados: EstadoDoDia[] = ["comum", "tenso", "descanso", "vazio"];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {estados.map((estado) => (
        <li key={estado} className="flex items-center gap-1.5">
          <svg viewBox="0 14 40 48" className="h-5 w-8" aria-hidden>
            <path
              d={caminho(estado, 0, 1)}
              fill="none"
              vectorEffect="non-scaling-stroke"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={estado === "vazio" ? "2 3" : undefined}
              className={CORES[estado]}
            />
          </svg>
          {DESCRICAO_ESTADOS[estado]}
        </li>
      ))}
    </ul>
  );
}
