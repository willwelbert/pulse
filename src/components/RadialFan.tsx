"use client";

import { useRef, useState } from "react";
import { tique } from "@/lib/haptics";
import { notaDoNivel, nivelVisual } from "@/lib/pulse/escala";
import { NOMES_DIMENSOES, rotuloDaNota } from "@/lib/pulse/formato";
import type { Dimensao, EstadoEmocional } from "@/lib/pulse/types";
import { cn } from "@/lib/utils";
import { HapticSwitch } from "./HapticSwitch";
import {
  alvoNoPonto,
  caminhoDaFatia,
  caminhoDoAnel,
  CENTRO,
  centroDoAnel,
  FUNDO,
  fatias,
  NIVEIS,
  nivelPorDistancia,
  posicaoDoRotulo,
  RAIO,
  TAMANHO,
} from "./radialGeometry";

type Props = {
  valores: Partial<EstadoEmocional>;
  onChange: (dimensao: Dimensao, nota: number) => void;
  /** A wedge got focus or was touched. */
  onAtivar?: (dimensao: Dimensao) => void;
  /** Hide the decorative hub, when a real button sits on the corner. */
  semCentro?: boolean;
  className?: string;
};

const NIVEIS_LISTA = Array.from({ length: NIVEIS }, (_, i) => i + 1);

/**
 * Leque de notas: a quarter circle anchored on the bottom-right corner, one
 * wedge per dimension and one ring per level. Further out is always better,
 * so Pressão is drawn inverted (see escala.ts).
 */
export function RadialFan({ valores, onChange, onAtivar, semCentro = false, className }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  // A drag stays on the wedge where it started.
  const arrastando = useRef<Dimensao | null>(null);
  const [foco, setFoco] = useState<Dimensao | null>(null);

  function definirNivel(dimensao: Dimensao, nivel: number) {
    const nota = notaDoNivel(dimensao, nivel);
    if (valores[dimensao] === nota) return;
    tique();
    onChange(dimensao, nota);
  }

  function pontoNoLeque(e: React.PointerEvent) {
    const matriz = svgRef.current?.getScreenCTM()?.inverse();
    return matriz ? new DOMPoint(e.clientX, e.clientY).matrixTransform(matriz) : null;
  }

  // Pointer input arrives through the HapticSwitch laid over the fan, so the
  // wedge is found by angle and the level by distance from the corner.
  function aoEncostar(e: React.PointerEvent) {
    const p = pontoNoLeque(e);
    const alvo = p && alvoNoPonto(p);
    if (!alvo) return;
    arrastando.current = alvo.dimensao;
    onAtivar?.(alvo.dimensao);
    definirNivel(alvo.dimensao, alvo.nivel);
  }

  function aoArrastar(e: React.PointerEvent) {
    const dimensao = arrastando.current;
    const p = dimensao && pontoNoLeque(e);
    if (dimensao && p) definirNivel(dimensao, nivelPorDistancia(Math.hypot(p.x - CENTRO.x, p.y - CENTRO.y)));
  }

  const soltar = () => (arrastando.current = null);

  function aoTeclar(dimensao: Dimensao, e: React.KeyboardEvent) {
    const atual = valores[dimensao] ? nivelVisual(dimensao, valores[dimensao]) : 0;
    const proximo: Record<string, number> = {
      ArrowUp: atual + 1,
      ArrowRight: atual + 1,
      ArrowDown: atual - 1,
      ArrowLeft: atual - 1,
      Home: 1,
      End: NIVEIS,
    };
    if (!(e.key in proximo)) return;
    e.preventDefault();
    definirNivel(dimensao, Math.min(NIVEIS, Math.max(1, proximo[e.key])));
  }

  return (
    <div
      className={cn("relative touch-none select-none", className)}
      onPointerDown={aoEncostar}
      onPointerMove={aoArrastar}
      onPointerUp={soltar}
      onPointerCancel={soltar}
    >
      <svg ref={svgRef} viewBox={`0 0 ${TAMANHO} ${TAMANHO}`} className="block w-full overflow-visible">
        {fatias.map((fatia) => {
          const { dimensao } = fatia;
          const nota = valores[dimensao];
          const nivel = nota ? nivelVisual(dimensao, nota) : 0;
          const rotulo = posicaoDoRotulo(fatia);
          const nome = NOMES_DIMENSOES[dimensao];

          return (
            <g key={dimensao}>
              <g
                role="slider"
                tabIndex={0}
                aria-label={nome}
                aria-valuemin={1}
                aria-valuemax={NIVEIS}
                aria-valuenow={nivel || undefined}
                aria-valuetext={`${nome}: ${nota ? rotuloDaNota(dimensao, nota) : "sem resposta"}`}
                className="cursor-pointer outline-none"
                onFocus={(e) => {
                  // Outline only for keyboard focus, not for a tap.
                  if (e.currentTarget.matches(":focus-visible")) setFoco(dimensao);
                  onAtivar?.(dimensao);
                }}
                onBlur={() => setFoco(null)}
                onKeyDown={(e) => aoTeclar(dimensao, e)}
              >
                {NIVEIS_LISTA.map((k) => (
                  <path
                    key={k}
                    d={caminhoDoAnel(fatia, k)}
                    fill={k <= nivel ? `var(--dim-${dimensao})` : "var(--card)"}
                    stroke="var(--border)"
                    strokeWidth={1.5}
                    className="transition-[fill] duration-150 motion-reduce:transition-none"
                  />
                ))}
                {foco === dimensao && (
                  <path d={caminhoDaFatia(fatia)} fill="none" stroke="var(--ring)" strokeWidth={3} />
                )}
              </g>

              {dimensao === "pressao" &&
                ([
                  [1, "muita"],
                  [NIVEIS, "pouca"],
                ] as const).map(([k, texto]) => {
                  const c = centroDoAnel(fatia, k);
                  return (
                    <text
                      key={texto}
                      x={c.x}
                      y={c.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={9}
                      aria-hidden
                      className={k <= nivel ? "pointer-events-none fill-white" : "pointer-events-none fill-muted-foreground"}
                    >
                      {texto}
                    </text>
                  );
                })}

              <text x={rotulo.x} y={rotulo.y} textAnchor="end" aria-hidden className="pointer-events-none">
                <tspan x={rotulo.x} dy="-0.3em" fontSize={13} fontWeight={600} className="fill-foreground">
                  {nome}
                </tspan>
                <tspan x={rotulo.x} dy="1.25em" fontSize={12} className="fill-muted-foreground">
                  {rotuloDaNota(dimensao, nota)}
                </tspan>
              </text>
            </g>
          );
        })}

        {!semCentro && (
          <>
            {/* Decorative hub on the corner, like a thumb rest. */}
            <circle cx={CENTRO.x} cy={CENTRO.y} r={FUNDO - 18} className="fill-primary" aria-hidden />
            <circle cx={CENTRO.x - 26} cy={CENTRO.y - 26} r={9} className="fill-primary-foreground" aria-hidden />
          </>
        )}
      </svg>
      {/* Only the quarter disc is tappable, so taps beside the fan pass through. */}
      <HapticSwitch style={{ clipPath: `circle(${(RAIO / TAMANHO) * 100}% at 100% 100%)` }} />
    </div>
  );
}
