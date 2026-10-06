"use client";

import { useState } from "react";
import { AJUDA_DIMENSOES, NOMES_DIMENSOES, perguntaDaDimensao, rotuloDaNota } from "@/lib/pulse/formato";
import type { Dimensao, EstadoEmocional } from "@/lib/pulse/types";
import { RadialFan } from "./RadialFan";

type Props = {
  valores: Partial<EstadoEmocional>;
  ontem: boolean;
  onChange: (dimensao: Dimensao, nota: number) => void;
};

/** The fan plus the active question, as used by the full check-in. */
export function RadialRating({ valores, ontem, onChange }: Props) {
  const [ativa, setAtiva] = useState<Dimensao | null>(null);

  return (
    <div className="space-y-2">
      <PerguntaAtiva ativa={ativa} valores={valores} ontem={ontem} />
      <div className="-mr-4 ml-auto w-[calc(100%+1rem)] max-w-[420px]">
        <RadialFan valores={valores} onChange={onChange} onAtivar={setAtiva} />
      </div>
    </div>
  );
}

type PerguntaProps = { ativa: Dimensao | null; valores: Partial<EstadoEmocional>; ontem: boolean };

export function PerguntaAtiva({ ativa, valores, ontem }: PerguntaProps) {
  return (
    <div aria-live="polite" className="min-h-16">
      {ativa ? (
        <>
          <p className="font-serif text-xl leading-tight">{perguntaDaDimensao(ativa, ontem)}</p>
          <p className="text-sm text-muted-foreground">
            {AJUDA_DIMENSOES[ativa] ?? `${NOMES_DIMENSOES[ativa]}: ${rotuloDaNota(ativa, valores[ativa])}`}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Toque ou arraste em cada fatia. Mais para fora, melhor.</p>
      )}
    </div>
  );
}
