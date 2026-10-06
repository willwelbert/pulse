import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONQUISTAS, type ConquistaDesbloqueada, type ConquistaId } from "@/lib/pulse/conquistas";
import { formatarDataCurta } from "@/lib/pulse/formato";
import { ICONES_CONQUISTAS } from "./conquistaIcones";

export function AchievementList({ desbloqueadas }: { desbloqueadas: ConquistaDesbloqueada[] }) {
  const quando = new Map(desbloqueadas.map((c) => [c.id, c.desbloqueadaEm]));
  const ids = Object.keys(CONQUISTAS) as ConquistaId[];

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {ids.map((id) => {
        const data = quando.get(id);
        const Icone = data ? ICONES_CONQUISTAS[id] : Lock;
        return (
          <li
            key={id}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3",
              data ? "border-secondary bg-muted" : "border-dashed bg-card text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full",
                data ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              <Icone className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className={cn("text-sm font-semibold", data && "text-foreground")}>{CONQUISTAS[id].titulo}</p>
              <p className="text-xs">
                {data ? `Desbloqueada em ${formatarDataCurta(data)}` : CONQUISTAS[id].descricao}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
