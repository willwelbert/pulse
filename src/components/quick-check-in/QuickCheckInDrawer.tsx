"use client";

import { HeartPulse, Moon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSalvarCheckIn } from "@/hooks/usePulse";
import { sucesso } from "@/lib/haptics";
import type { EstadoEmocional, IndicadoresOperacionais, TipoCheckIn } from "@/lib/pulse/types";
import type { CheckInSalvo, PulseHoje } from "@/utils/adapters/pulseAdapter";
import { ResumoDoCheckIn } from "../CheckInConclusion";
import { HapticSwitch } from "../HapticSwitch";
import { OperationalFields } from "../OperationalFields";

type Props = {
  pulse: PulseHoje;
  emocional: EstadoEmocional;
  /** Closed before saving: back to the fan. */
  onVoltar: () => void;
  /** Closed after saving. */
  onConcluir: () => void;
};

/** The rest of a quick check-in, which always records today. */
export function QuickCheckInDrawer({ pulse, emocional, onVoltar, onConcluir }: Props) {
  const existente = pulse.checkInHoje;
  const [tipo, setTipo] = useState<TipoCheckIn>(existente?.tipo ?? "regular");
  const [operacional, setOperacional] = useState<IndicadoresOperacionais>(
    existente?.operacional ?? { conteudos: 0, reunioes: 0, minutosTrabalhados: pulse.ultimoMinutosTrabalhados ?? 0 },
  );
  const [salvo, setSalvo] = useState<CheckInSalvo | null>(null);
  const salvar = useSalvarCheckIn();

  async function enviar() {
    try {
      const resultado = await salvar.mutateAsync({
        date: pulse.hoje,
        tipo,
        emocional,
        operacional: tipo === "regular" ? operacional : null,
      });
      sucesso();
      setSalvo(resultado);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar o check-in.");
    }
  }

  return (
    <Drawer open onOpenChange={(aberto) => !aberto && (salvo ? onConcluir() : onVoltar())}>
      <DrawerContent className="max-h-[92dvh]">
        <div className="mx-auto w-full max-w-lg overflow-y-auto px-4">
          {salvo ? (
            <div className="flex flex-col gap-5 py-4">
              <DrawerTitle className="sr-only">Check-in salvo</DrawerTitle>
              <ResumoDoCheckIn salvo={salvo} />
            </div>
          ) : (
            <>
              <DrawerHeader className="px-0">
                <DrawerTitle className="font-serif text-2xl">Falta pouco</DrawerTitle>
                <DrawerDescription>O emocional está pronto. Agora o resto do dia.</DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4 pb-2">
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={tipo}
                  onValueChange={(valor) => valor && setTipo(valor as TipoCheckIn)}
                  className="w-full"
                  aria-label="Tipo do dia"
                >
                  <ToggleGroupItem value="regular" className="h-12 flex-1">
                    <HeartPulse aria-hidden /> Dia normal
                  </ToggleGroupItem>
                  <ToggleGroupItem value="descanso" className="h-12 flex-1">
                    <Moon aria-hidden /> Dia de descanso
                  </ToggleGroupItem>
                </ToggleGroup>
                {tipo === "regular" ? (
                  <OperationalFields valor={operacional} onChange={setOperacional} />
                ) : (
                  <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                    Descansar também é constância. Esse dia conta para o seu ritmo, sem indicadores.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <DrawerFooter className="mx-auto w-full max-w-lg pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {salvo ? (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-12" onClick={onConcluir}>
                Fechar
              </Button>
              <Button asChild className="h-12" onClick={onConcluir}>
                <Link href="/">Ver meu Pulse</Link>
              </Button>
            </div>
          ) : (
            // Clicks reach this wrapper from the haptic label (taps) or the button (keyboard).
            <div className="relative" onClick={() => !salvar.isPending && enviar()}>
              <Button size="lg" className="h-12 w-full text-base" disabled={salvar.isPending}>
                {salvar.isPending ? "Salvando…" : "Salvar check-in"}
              </Button>
              <HapticSwitch className="rounded-lg" />
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
