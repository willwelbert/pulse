import { cn } from "@/lib/utils";
import { AJUDA_DIMENSOES, perguntaDaDimensao, ROTULOS_NOTAS } from "@/lib/pulse/formato";
import type { Dimensao } from "@/lib/pulse/types";

type Props = {
  dimensao: Dimensao;
  ontem: boolean;
  valor: number | undefined;
  onEscolher: (nota: number) => void;
};

export function RatingStep({ dimensao, ontem, valor, onEscolher }: Props) {
  const rotulos = ROTULOS_NOTAS[dimensao];
  const ajuda = AJUDA_DIMENSOES[dimensao];
  const tituloId = `pergunta-${dimensao}`;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 id={tituloId} className="font-serif text-2xl leading-tight">
          {perguntaDaDimensao(dimensao, ontem)}
        </h2>
        {ajuda && <p className="text-sm text-muted-foreground">{ajuda}</p>}
      </div>
      <div role="radiogroup" aria-labelledby={tituloId} className="grid grid-cols-5 gap-2">
        {rotulos.map((rotulo, i) => {
          const nota = i + 1;
          const marcado = valor === nota;
          return (
            <button
              key={nota}
              type="button"
              role="radio"
              aria-checked={marcado}
              aria-label={`${nota} — ${rotulo}`}
              onClick={() => onEscolher(nota)}
              className={cn(
                "num grid h-16 place-items-center rounded-xl border-2 text-3xl transition-colors",
                "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                marcado
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/50",
              )}
            >
              {nota}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{rotulos[0]}</span>
        <span>{rotulos[4]}</span>
      </div>
      <p className="h-7 text-center font-serif text-xl" aria-live="polite">
        {valor ? rotulos[valor - 1] : ""}
      </p>
    </div>
  );
}
