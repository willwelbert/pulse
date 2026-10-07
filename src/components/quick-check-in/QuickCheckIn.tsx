"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePulseHoje } from "@/hooks/usePulse";
import { DIMENSOES, type Dimensao, type EstadoEmocional } from "@/lib/pulse/types";
import { RadialFan } from "../RadialFan";
import { PerguntaAtiva } from "../RadialRating";
import { PulseHoldButton } from "./PulseHoldButton";
import { QuickCheckInDrawer } from "./QuickCheckInDrawer";

type Fase = "fechado" | "leque" | "drawer";

/**
 * Check-in from anywhere: hold the Pulse button, rate on the fan, then finish
 * the rest of the day in a Drawer. Hidden on the full check-in page.
 */
export function QuickCheckIn() {
  const pathname = usePathname();
  const { data: pulse } = usePulseHoje();
  const [fase, setFase] = useState<Fase>("fechado");
  const [emocional, setEmocional] = useState<Partial<EstadoEmocional>>({});
  const [ativa, setAtiva] = useState<Dimensao | null>(null);
  const leque = useRef<HTMLDivElement>(null);

  const respondidas = DIMENSOES.filter((d) => emocional[d] !== undefined).length;

  useEffect(() => {
    if (fase !== "leque") return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setFase("fechado");
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [fase]);

  // trailingSlash makes the route "/check-in/" in the static build.
  if (pathname?.replace(/\/$/, "") === "/check-in" || !pulse) return null;

  function abrir(origem: "toque" | "teclado") {
    setEmocional(pulse?.checkInHoje?.emocional ?? {});
    setAtiva(null);
    setFase("leque");
    if (origem === "teclado") {
      requestAnimationFrame(() => leque.current?.querySelector<SVGElement>('[role="slider"]')?.focus());
    }
  }

  return (
    <>
      {fase === "leque" && (
        <div role="dialog" aria-modal="true" aria-label="Check-in rápido" className="fixed inset-0 z-40">
          <div
            className="absolute inset-0 animate-in bg-background/80 backdrop-blur-sm duration-200 fade-in"
            onClick={() => setFase("fechado")}
            aria-hidden
          />
          <div className="absolute inset-x-4 top-[calc(1rem+env(safe-area-inset-top))] mx-auto flex max-w-lg animate-in items-start gap-3 rounded-2xl border bg-card p-4 shadow-sm duration-300 fade-in slide-in-from-top-2">
            <div className="min-w-0 flex-1">
              <p className="eyebrow mb-1">Como você está hoje?</p>
              <PerguntaAtiva ativa={ativa} valores={emocional} ontem={false} />
            </div>
            <Button variant="ghost" size="icon" className="size-11 shrink-0" onClick={() => setFase("fechado")} aria-label="Fechar check-in rápido">
              <X aria-hidden />
            </Button>
          </div>
          {/* The fan's corner (its centre) sits exactly on the Pulse button's centre. */}
          <div
            ref={leque}
            className="absolute right-[calc(3rem+env(safe-area-inset-right))] bottom-[calc(3rem+env(safe-area-inset-bottom))] w-[min(calc(100vw-4rem),400px)] origin-bottom-right animate-in duration-300 fade-in zoom-in-50"
          >
            <RadialFan
              semCentro
              valores={emocional}
              onAtivar={setAtiva}
              onChange={(dimensao, nota) => setEmocional((atual) => ({ ...atual, [dimensao]: nota }))}
            />
          </div>
        </div>
      )}

      {fase !== "drawer" && (
        <PulseHoldButton
          aberto={fase === "leque"}
          respondidas={respondidas}
          onAbrir={abrir}
          onConfirmar={() => setFase("drawer")}
        />
      )}

      {fase === "drawer" && (
        <QuickCheckInDrawer
          pulse={pulse}
          emocional={emocional as EstadoEmocional}
          onVoltar={() => setFase("leque")}
          onConcluir={() => setFase("fechado")}
        />
      )}
    </>
  );
}
