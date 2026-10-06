"use client";

import { ArrowLeft, CalendarClock, HeartPulse, Moon, NotebookPen, Sun } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSalvarCheckIn } from "@/hooks/usePulse";
import { formatarData } from "@/lib/pulse/formato";
import {
  type CheckIn,
  DIMENSOES,
  type EstadoEmocional,
  type IndicadoresOperacionais,
  type IsoDate,
  type TipoCheckIn,
} from "@/lib/pulse/types";
import type { CheckInSalvo, PulseHoje } from "@/utils/adapters/pulseAdapter";
import { ChoiceCard } from "./ChoiceCard";
import { OperationalFields } from "./OperationalFields";
import { CheckInConclusion } from "./CheckInConclusion";
import { RadialRating } from "./RadialRating";

type Passo = "dia" | "tipo" | "registrar-emocional" | "emocional" | "operacional";

type Rascunho = {
  date: IsoDate | null;
  tipo: TipoCheckIn | null;
  registrarEmocional: boolean;
  emocional: Partial<EstadoEmocional>;
  operacional: IndicadoresOperacionais;
};

function rascunhoDe(existente: CheckIn | null, date: IsoDate | null, tipo: TipoCheckIn | null, minutos: number): Rascunho {
  return {
    date,
    tipo: tipo ?? existente?.tipo ?? null,
    registrarEmocional: existente?.tipo === "descanso" && existente.emocional !== null,
    emocional: existente?.emocional ?? {},
    operacional: existente?.operacional ?? { conteudos: 0, reunioes: 0, minutosTrabalhados: minutos },
  };
}

function passosDe(r: Rascunho, escolherDia: boolean): Passo[] {
  // Until a type is picked, count the steps of a regular day (the longest path).
  const tipo = r.tipo ?? "regular";
  const comEmocional = tipo === "regular" || r.registrarEmocional;
  return [
    ...(escolherDia ? (["dia"] as const) : []),
    "tipo",
    ...(tipo === "descanso" ? (["registrar-emocional"] as const) : []),
    ...(comEmocional ? (["emocional"] as const) : []),
    ...(tipo === "regular" ? (["operacional"] as const) : []),
  ];
}

function montarCheckIn(r: Rascunho): CheckIn {
  const comEmocional = r.tipo === "regular" || r.registrarEmocional;
  return {
    date: r.date!,
    tipo: r.tipo!,
    emocional: comEmocional ? (r.emocional as EstadoEmocional) : null,
    operacional: r.tipo === "regular" ? r.operacional : null,
  };
}

const AVANCO_AUTOMATICO_MS = 220;

type Props = { pulse: PulseHoje; tipoInicial: TipoCheckIn | null };

export function CheckInStepper({ pulse, tipoInicial }: Props) {
  const { hoje, ontem, checkInHoje, checkInOntem, ultimoMinutosTrabalhados } = pulse;
  // Yesterday can still be registered only while it is empty.
  const escolherDia = checkInOntem === null;
  const existenteDe = (date: IsoDate | null) => (date === hoje ? checkInHoje : date === ontem ? checkInOntem : null);

  const [rascunho, setRascunho] = useState<Rascunho>(() => {
    const date = escolherDia ? null : hoje;
    return rascunhoDe(existenteDe(date), date, tipoInicial, ultimoMinutosTrabalhados ?? 0);
  });
  const [indice, setIndice] = useState(0);
  const [salvo, setSalvo] = useState<CheckInSalvo | null>(null);
  const salvar = useSalvarCheckIn();
  // Blocks a second tap while an auto-advance is pending, so no step gets skipped.
  const avancando = useRef(false);

  const passos = passosDe(rascunho, escolherDia);
  const passo = passos[indice];
  const ehOntem = rascunho.date === ontem;

  if (salvo) return <CheckInConclusion salvo={salvo} />;

  async function enviar(final: Rascunho) {
    try {
      setSalvo(await salvar.mutateAsync(montarCheckIn(final)));
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar o check-in.");
    }
  }

  /** Applies a choice and moves on; submits when it was the last step. */
  function avancar(mudanca: Partial<Rascunho> = {}, atraso = 0) {
    if (avancando.current) return;
    const proximo = { ...rascunho, ...mudanca };
    setRascunho(proximo);
    const proximosPassos = passosDe(proximo, escolherDia);
    avancando.current = true;
    const ir = () => {
      avancando.current = false;
      if (indice + 1 >= proximosPassos.length) void enviar(proximo);
      else setIndice(indice + 1);
    };
    if (atraso) setTimeout(ir, atraso);
    else ir();
  }

  function escolherData(date: IsoDate) {
    const existente = existenteDe(date);
    const base = rascunhoDe(existente, date, rascunho.tipo ?? tipoInicial, ultimoMinutosTrabalhados ?? 0);
    avancar(base);
  }

  const respondidas = DIMENSOES.filter((d) => rascunho.emocional[d] !== undefined).length;
  const podeContinuar =
    passo === "operacional" ||
    (passo === "tipo" && rascunho.tipo !== null) ||
    (passo === "emocional" && respondidas === DIMENSOES.length);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col gap-6">
      <header className="space-y-3">
        {/* pr-12 leaves room for the Modo demonstração button */}
        <div className="flex items-center justify-between gap-2 pr-12">
          {indice > 0 ? (
            <Button variant="ghost" className="-ml-2 h-11" onClick={() => setIndice(indice - 1)}>
              <ArrowLeft aria-hidden /> Voltar
            </Button>
          ) : (
            <Button asChild variant="ghost" className="-ml-2 h-11">
              <Link href="/">
                <ArrowLeft aria-hidden /> Pulse
              </Link>
            </Button>
          )}
          {rascunho.date && <p className="text-sm text-muted-foreground first-letter:uppercase">{formatarData(rascunho.date)}</p>}
        </div>
        <Progress value={(indice / passos.length) * 100} aria-label={`Passo ${indice + 1} de ${passos.length}`} />
      </header>

      <main className="flex-1">
        {passo === "dia" && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl leading-tight">De qual dia é este check-in?</h2>
            <p className="text-sm text-muted-foreground">Ontem ficou sem registro. Dá tempo de registrar.</p>
            <ChoiceCard
              icone={Sun}
              titulo="Hoje"
              descricao={checkInHoje ? "Editar o check-in de hoje" : formatarData(hoje)}
              marcado={rascunho.date === hoje}
              onClick={() => escolherData(hoje)}
            />
            <ChoiceCard
              icone={CalendarClock}
              titulo="Ontem"
              descricao={`Esqueci de registrar · ${formatarData(ontem)}`}
              marcado={rascunho.date === ontem}
              onClick={() => escolherData(ontem)}
            />
          </div>
        )}

        {passo === "tipo" && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl leading-tight">{ehOntem ? "Como foi ontem?" : "Como é o dia de hoje?"}</h2>
            <ChoiceCard
              icone={HeartPulse}
              titulo="Dia normal"
              descricao="Registrar como você está e o que produziu."
              marcado={rascunho.tipo === "regular"}
              onClick={() => avancar({ tipo: "regular" }, AVANCO_AUTOMATICO_MS)}
            />
            <ChoiceCard
              icone={Moon}
              titulo="Dia de descanso"
              descricao="Pausa intencional. Conta para o seu ritmo."
              marcado={rascunho.tipo === "descanso"}
              onClick={() => avancar({ tipo: "descanso" }, AVANCO_AUTOMATICO_MS)}
            />
          </div>
        )}

        {passo === "registrar-emocional" && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl leading-tight">Quer registrar como você está?</h2>
            <p className="text-sm text-muted-foreground">É opcional. O descanso conta para o ritmo de qualquer jeito.</p>
            <ChoiceCard
              icone={NotebookPen}
              titulo="Sim, registrar"
              descricao="Cinco perguntas rápidas."
              onClick={() => avancar({ registrarEmocional: true })}
            />
            <ChoiceCard
              icone={Moon}
              titulo="Só o descanso"
              descricao="Salvar agora."
              onClick={() => avancar({ registrarEmocional: false })}
            />
          </div>
        )}

        {passo === "emocional" && (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-2xl leading-tight">
                {ehOntem ? "Como você estava ontem?" : "Como você está hoje?"}
              </h2>
              <p className="shrink-0 text-sm text-muted-foreground" aria-live="polite">
                <span className="num text-xl text-foreground">{respondidas}</span> de {DIMENSOES.length}
              </p>
            </div>
            <RadialRating
              valores={rascunho.emocional}
              ontem={ehOntem}
              onChange={(dimensao, nota) =>
                setRascunho((r) => ({ ...r, emocional: { ...r.emocional, [dimensao]: nota } }))
              }
            />
          </div>
        )}

        {passo === "operacional" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl leading-tight">E a parte operacional?</h2>
              <p className="text-sm text-muted-foreground">
                Campanhas ativas já vêm do Radar. Aqui é só o que a gente não consegue saber sozinho.
              </p>
            </div>
            <OperationalFields
              valor={rascunho.operacional}
              onChange={(operacional) => setRascunho({ ...rascunho, operacional })}
            />
          </div>
        )}
      </main>

      {passo !== "dia" && passo !== "registrar-emocional" && (
        <footer className="sticky bottom-0 -mx-4 bg-background/90 px-4 pt-2 pb-4 backdrop-blur">
          <Button
            size="lg"
            className="h-12 w-full text-base"
            disabled={!podeContinuar || salvar.isPending}
            onClick={() => avancar()}
          >
            {indice + 1 >= passos.length ? (salvar.isPending ? "Salvando…" : "Salvar check-in") : "Continuar"}
          </Button>
        </footer>
      )}
    </div>
  );
}
