import { MINIMO_PARA_SCORE, rotuloDoScore, type PulseScore } from "@/lib/pulse/score";

const RAIO = 42;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

export function ScoreRing({ score }: { score: PulseScore }) {
  const fracao = (score.valor ?? 0) / 100;

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-24 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={RAIO} fill="none" strokeWidth="8" className="stroke-muted" />
          <circle
            cx="50"
            cy="50"
            r={RAIO}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUNFERENCIA}
            strokeDashoffset={CIRCUNFERENCIA * (1 - fracao)}
            className="stroke-primary transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none"
          />
        </svg>
        <span className="num absolute inset-0 grid place-items-center text-3xl text-foreground">
          {score.valor ?? "—"}
        </span>
      </div>
      <div className="min-w-0">
        <p className="eyebrow">Pulse Score</p>
        {score.estado === "pronto" && (
          <p className="font-serif text-xl">{rotuloDoScore(score.valor)}</p>
        )}
        {score.estado === "retrato-inicial" && <p className="font-serif text-xl">Retrato inicial</p>}
        {score.estado === "vazio" && <p className="font-serif text-xl">Sem check-ins</p>}
        <p className="text-sm text-muted-foreground">
          {score.estado === "pronto"
            ? `Baseado em ${score.diasRegistrados} dias registrados nos últimos 7.`
            : `O Score ganha leitura a partir de ${MINIMO_PARA_SCORE} check-ins nos últimos 7 dias (${score.diasRegistrados} até agora).`}
        </p>
      </div>
    </div>
  );
}
