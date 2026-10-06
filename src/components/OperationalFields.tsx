import type { IndicadoresOperacionais } from "@/lib/pulse/types";
import { Counter } from "./Counter";
import { TimeWorkedField } from "./TimeWorkedField";

type Props = {
  valor: IndicadoresOperacionais;
  onChange: (valor: IndicadoresOperacionais) => void;
};

/** The manual part of a check-in. Campanhas ativas come from the Radar. */
export function OperationalFields({ valor, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl border bg-card p-4">
        <Counter
          rotulo="Conteúdos produzidos"
          valor={valor.conteudos}
          onChange={(conteudos) => onChange({ ...valor, conteudos })}
        />
        <Counter rotulo="Reuniões" valor={valor.reunioes} onChange={(reunioes) => onChange({ ...valor, reunioes })} />
      </div>
      <div className="rounded-2xl border bg-card p-4">
        <TimeWorkedField
          minutos={valor.minutosTrabalhados}
          onChange={(minutosTrabalhados) => onChange({ ...valor, minutosTrabalhados })}
        />
      </div>
    </div>
  );
}
