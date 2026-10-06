"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePulseDashboard } from "@/hooks/usePulse";
import { tomDaConclusao, type TomDaConclusao } from "@/lib/pulse/acolhimento";
import { CONQUISTAS, type ConquistaId } from "@/lib/pulse/conquistas";
import { linhaDePulso } from "@/lib/pulse/linha";
import { META_SEMANAL } from "@/lib/pulse/ritmo";
import { pulseDiario } from "@/lib/pulse/score";
import type { CheckInSalvo } from "@/utils/adapters/pulseAdapter";
import { ICONES_CONQUISTAS } from "./conquistaIcones";
import { PulseLine } from "./PulseLine";

const TEXTOS: Record<TomDaConclusao, { titulo: string; mensagem: string }> = {
  celebrar: { titulo: "Pulso registrado", mensagem: "Mais um batimento na sua linha. Bom te ver por aqui." },
  acolher: {
    titulo: "Obrigado por registrar",
    mensagem: "Dias pesados acontecem. Registrar já é uma forma de cuidar de você.",
  },
  descanso: { titulo: "Descanso registrado", mensagem: "Descansar também é constância. Esse dia conta para o seu ritmo." },
};

export function CheckInConclusion({ salvo }: { salvo: CheckInSalvo }) {
  const { painel } = usePulseDashboard();
  const { checkIn, novasConquistas } = salvo;

  if (!painel) return <Skeleton className="h-96 w-full rounded-2xl" />;

  const tom = tomDaConclusao(checkIn, painel.acolhimento);
  const texto = TEXTOS[tom];
  const linha = linhaDePulso(painel.checkIns, checkIn.date, 7);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col gap-6 pt-6">
      <section className="space-y-2 text-center">
        <h1 className="font-serif text-3xl">{texto.titulo}</h1>
        <p className="text-muted-foreground">{texto.mensagem}</p>
        {painel.acolhimento && tom !== "descanso" && (
          <p className="text-sm text-muted-foreground">
            Se precisar, amanhã você pode declarar um Dia de descanso. Ele conta para o ritmo.
          </p>
        )}
      </section>

      {checkIn.emocional && (
        <section className="text-center" aria-label="Pulse Diário">
          <p className="eyebrow">Pulse Diário</p>
          <p className="num text-7xl">{pulseDiario(checkIn.emocional)}</p>
        </section>
      )}

      <section className="rounded-2xl border bg-card p-4">
        <PulseLine batimentos={linha} semanasSeguidas={painel.semanasSeguidas} animarUltimo />
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {painel.ritmo.registrados} de {META_SEMANAL} dias nesta semana
          {painel.ritmo.atingido ? " · semana no ritmo" : ""}
        </p>
      </section>

      {novasConquistas.length > 0 && (
        <section className="space-y-2" aria-label="Novas conquistas">
          {novasConquistas.map(({ id }) => {
            const Icone = ICONES_CONQUISTAS[id as ConquistaId];
            const conquista = CONQUISTAS[id as ConquistaId];
            return (
              <div
                key={id}
                className="flex animate-in items-center gap-3 rounded-2xl border-2 border-primary bg-muted p-4 duration-500 fade-in zoom-in-95"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Icone className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="flex items-center gap-1 text-xs font-semibold text-primary">
                    <Sparkles className="size-3.5" aria-hidden /> Nova conquista
                  </p>
                  <p className="font-semibold">{conquista.titulo}</p>
                  <p className="text-sm text-muted-foreground">{conquista.descricao}</p>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <Button asChild size="lg" className="mt-auto h-12 w-full text-base">
        <Link href="/">Ver meu Pulse</Link>
      </Button>
    </div>
  );
}
