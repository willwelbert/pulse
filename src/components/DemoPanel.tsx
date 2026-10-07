"use client";

import { FastForward, FlaskConical, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { InstallSection } from "@/components/InstallSection";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useHoje } from "@/hooks/useHoje";
import { avancarDias, hojeReal, resetarRelogio } from "@/lib/clock";
import { formatarData } from "@/lib/pulse/formato";
import { aplicarCenario, CENARIOS, resetarDemonstracao } from "@/utils/mock/cenarios";

/** Modo demonstração: simulate days and load histories without waiting real time. */
export function DemoPanel() {
  const hoje = useHoje();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const simulado = hoje !== null && hoje !== hojeReal();

  function irParaOInicio(mensagem: string) {
    setAberto(false);
    router.push("/");
    window.scrollTo({ top: 0 });
    toast.success(mensagem);
  }

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="fixed top-[calc(1rem+env(safe-area-inset-top))] right-[calc(1rem+env(safe-area-inset-right))] z-40 size-11 rounded-full shadow-md"
          aria-label="Abrir Modo demonstração"
        >
          <FlaskConical className="size-5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Modo demonstração</SheetTitle>
          <SheetDescription>
            Hoje simulado: <span className="font-semibold text-foreground">{hoje ? formatarData(hoje) : "…"}</span>
            {simulado && " (fora da data real)"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-12" onClick={() => avancarDias(1)}>
              <FastForward aria-hidden /> Avançar 1 dia
            </Button>
            <Button variant="outline" className="h-12" disabled={!simulado} onClick={resetarRelogio}>
              <RotateCcw aria-hidden /> Data real
            </Button>
          </div>

          <section className="space-y-2">
            <h3 className="eyebrow">Cenários</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {CENARIOS.map((cenario) => (
                <li key={cenario.id}>
                  <button
                    type="button"
                    className="w-full rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    onClick={() => {
                      aplicarCenario(cenario);
                      irParaOInicio(`Cenário carregado: ${cenario.titulo}`);
                    }}
                  >
                    <span className="block text-sm font-semibold">{cenario.titulo}</span>
                    <span className="block text-xs text-muted-foreground">{cenario.descricao}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <InstallSection />

          <Button
            variant="ghost"
            className="h-12 w-full text-destructive"
            onClick={() => {
              resetarDemonstracao();
              irParaOInicio("Histórico apagado");
            }}
          >
            Apagar histórico e voltar à data real
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
