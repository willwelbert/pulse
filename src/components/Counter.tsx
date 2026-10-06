import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { rotulo: string; valor: number; onChange: (valor: number) => void };

export function Counter({ rotulo, valor, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold">{rotulo}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="size-12"
          disabled={valor === 0}
          onClick={() => onChange(valor - 1)}
          aria-label={`Diminuir ${rotulo.toLowerCase()}`}
        >
          <Minus aria-hidden />
        </Button>
        <output className="num w-10 text-center text-3xl" aria-label={rotulo}>
          {valor}
        </output>
        <Button
          type="button"
          variant="outline"
          className="size-12"
          onClick={() => onChange(valor + 1)}
          aria-label={`Aumentar ${rotulo.toLowerCase()}`}
        >
          <Plus aria-hidden />
        </Button>
      </div>
    </div>
  );
}
