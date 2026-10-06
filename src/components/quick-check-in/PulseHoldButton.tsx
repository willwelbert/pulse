"use client";

import { Activity, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { batimento, sucesso } from "@/lib/haptics";
import { DIMENSOES } from "@/lib/pulse/types";
import { cn } from "@/lib/utils";
import { HapticSwitch } from "../HapticSwitch";

/** How long to hold, like feeling for a pulse. Two heartbeats. */
export const HOLD_MS = 1200;
const DICA_MS = 1600;

const RAIO = 30;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

type Props = {
  /** Open: the button turns into the fan's hub. */
  aberto: boolean;
  respondidas: number;
  /** `teclado` when opened without holding, so focus can move into the fan. */
  onAbrir: (origem: "toque" | "teclado") => void;
  onConfirmar: () => void;
};

export function PulseHoldButton({ aberto, respondidas, onAbrir, onConfirmar }: Props) {
  const [segurando, setSegurando] = useState(false);
  const [dica, setDica] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // The release that ends a successful hold also fires a click: it must not confirm.
  const ignorarProximoClique = useRef(false);

  const limpar = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => limpar, []);

  function comecar() {
    // A new gesture: whatever happened to the last release no longer matters.
    ignorarProximoClique.current = false;
    if (aberto) return;
    limpar();
    setDica(false);
    setSegurando(true);
    // Android only: iOS has no vibration API, and its switch haptic needs a real tap,
    // so on iPhone the HapticSwitch ticks once on release instead.
    batimento();
    timers.current = [
      setTimeout(batimento, HOLD_MS / 2),
      setTimeout(() => {
        setSegurando(false);
        sucesso();
        ignorarProximoClique.current = true;
        onAbrir("toque");
      }, HOLD_MS),
    ];
  }

  function soltar() {
    if (!segurando) return;
    limpar();
    setSegurando(false);
    setDica(true);
    timers.current = [setTimeout(() => setDica(false), DICA_MS)];
  }

  const completo = respondidas === DIMENSOES.length;
  const rotulo = !aberto
    ? "Check-in rápido. Segure para abrir."
    : completo
      ? "Continuar para os indicadores do dia"
      : `Responda as 5 fatias (${respondidas} de ${DIMENSOES.length})`;

  return (
    <div className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50">
      <p
        aria-live="polite"
        className={cn(
          "absolute top-1/2 right-full mr-3 -translate-y-1/2 rounded-full bg-foreground px-3 py-1.5 text-sm whitespace-nowrap text-background shadow-md transition-opacity",
          dica ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {dica ? "Continue segurando" : ""}
      </p>

      {/* Pointer input reaches this wrapper through the HapticSwitch on top of the
          button (needed for the iOS haptic); keyboard clicks bubble here from the button. */}
      <div
        className={cn(
          "relative size-16 touch-none rounded-full select-none [-webkit-touch-callout:none]",
          segurando && "animate-batimento",
        )}
        onPointerDown={comecar}
        onPointerUp={soltar}
        onPointerLeave={soltar}
        onPointerCancel={soltar}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          if (ignorarProximoClique.current) {
            ignorarProximoClique.current = false;
            return;
          }
          if (aberto) {
            if (completo) onConfirmar();
          }
          // Keyboard and screen readers activate with a click of detail 0: no hold needed.
          else if (e.detail === 0) onAbrir("teclado");
        }}
      >
        <button
          type="button"
          aria-label={rotulo}
          aria-disabled={aberto && !completo}
          className={cn(
            "relative grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg",
            "focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none",
          )}
        >
          <svg viewBox="0 0 68 68" className="pointer-events-none absolute -inset-0.5 size-[68px] -rotate-90" aria-hidden>
            <circle
              cx="34"
              cy="34"
              r={RAIO}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={segurando || (aberto && completo) ? 0 : CIRCUNFERENCIA}
              className="stroke-primary-foreground/80"
              style={{
                transition: segurando ? `stroke-dashoffset ${HOLD_MS}ms linear` : "stroke-dashoffset 150ms",
              }}
            />
          </svg>

          {!aberto && (
            <span className="flex flex-col items-center leading-none">
              <Activity className="size-6" aria-hidden />
              <span className="mt-1 text-[10px] font-semibold tracking-wide">segure</span>
            </span>
          )}
          {aberto && completo && <Check className="size-7" aria-hidden />}
          {aberto && !completo && <span className="num text-xl">{`${respondidas}/${DIMENSOES.length}`}</span>}
        </button>
        <HapticSwitch className="rounded-full" style={{ clipPath: "circle(50%)" }} />
      </div>
    </div>
  );
}
