import { Button } from "@/components/ui/button";
import { ajustarTempo, ATALHOS_DE_TEMPO, formatarAtalho, formatarTempo } from "@/lib/pulse/tempo";

type Props = { minutos: number; onChange: (minutos: number) => void };

export function TimeWorkedField({ minutos, onChange }: Props) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold">Tempo trabalhado</legend>
      <output className="num block text-center text-5xl" aria-live="polite">
        {formatarTempo(minutos)}
      </output>
      <div className="grid grid-cols-4 gap-2">
        {ATALHOS_DE_TEMPO.map((delta) => (
          <Button
            key={delta}
            type="button"
            variant="outline"
            className="h-12 text-base tabular-nums"
            onClick={() => onChange(ajustarTempo(minutos, delta))}
            aria-label={`${delta > 0 ? "Somar" : "Tirar"} ${formatarAtalho(delta).slice(1)}`}
          >
            {formatarAtalho(delta)}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}
