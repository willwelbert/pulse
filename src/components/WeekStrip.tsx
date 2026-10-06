import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { daysBetween } from "@/lib/pulse/datas";
import { DESCRICAO_ESTADOS, formatarData, inicialDoDia } from "@/lib/pulse/formato";
import { estadoDoDia } from "@/lib/pulse/linha";
import { META_SEMANAL, type RitmoDaSemana } from "@/lib/pulse/ritmo";
import type { IsoDate } from "@/lib/pulse/types";

const FUNDO = {
  comum: "bg-pulse-comum text-white",
  tenso: "bg-pulse-tenso text-white",
  descanso: "bg-pulse-descanso text-white",
  vazio: "bg-muted text-muted-foreground",
} as const;

function mensagem(ritmo: RitmoDaSemana): string {
  if (ritmo.atingido) return "Semana no ritmo. Tudo o que vier agora é bônus.";
  if (!ritmo.aindaPossivel) return "Essa semana não fecha a meta, e tudo bem. A próxima começa segunda.";
  return ritmo.faltam === 1 ? "Falta 1 dia para fechar a semana." : `Faltam ${ritmo.faltam} dias para fechar a semana.`;
}

export function WeekStrip({ ritmo, hoje }: { ritmo: RitmoDaSemana; hoje: IsoDate }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="eyebrow">Ritmo da semana</p>
        <p className="text-sm">
          <span className="num text-2xl">{ritmo.registrados}</span>
          <span className="text-muted-foreground"> de {META_SEMANAL}</span>
        </p>
      </div>
      <ol className="grid grid-cols-7 gap-1.5">
        {ritmo.dias.map((dia) => {
          const estado = estadoDoDia(dia.checkIn);
          const ehHoje = dia.date === hoje;
          const futuro = daysBetween(hoje, dia.date) > 0;
          return (
            <li key={dia.date} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "grid aspect-square w-full max-w-11 place-items-center rounded-full text-sm font-semibold",
                  FUNDO[estado],
                  futuro && "opacity-50",
                  ehHoje && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                )}
                aria-label={`${formatarData(dia.date)}: ${futuro ? "ainda não chegou" : DESCRICAO_ESTADOS[estado]}`}
              >
                {inicialDoDia(dia.date)}
              </span>
            </li>
          );
        })}
      </ol>
      <Progress value={(Math.min(ritmo.registrados, META_SEMANAL) / META_SEMANAL) * 100} aria-label="Progresso da meta semanal" />
      <p className="text-sm text-muted-foreground">{mensagem(ritmo)}</p>
    </div>
  );
}
