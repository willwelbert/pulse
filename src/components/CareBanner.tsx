import { Moon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Shown while Modo acolhimento is on: stops celebrating, offers rest, never penalises. */
export function CareBanner() {
  return (
    <section
      aria-labelledby="acolhimento-titulo"
      className="rounded-2xl border border-pulse-descanso/30 bg-pulse-descanso/10 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <Moon className="mt-0.5 size-5 shrink-0 text-pulse-descanso" aria-hidden />
        <div className="space-y-1">
          <h2 id="acolhimento-titulo" className="font-serif text-lg">
            Semana puxada por aí?
          </h2>
          <p className="text-sm text-muted-foreground">
            Seus últimos 3 check-ins vieram com pressão alta. Um Dia de descanso conta para o seu ritmo, como qualquer
            outro dia.
          </p>
        </div>
      </div>
      <Button asChild size="lg" variant="secondary" className="mt-4 h-12 w-full">
        <Link href="/check-in?tipo=descanso">Declarar Dia de descanso</Link>
      </Button>
    </section>
  );
}
