import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  marcado?: boolean;
  onClick: () => void;
};

/** Large tappable option used by the check-in's choice steps. */
export function ChoiceCard({ icone: Icone, titulo, descricao, marcado = false, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={marcado}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left transition-colors",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        marcado ? "border-primary" : "border-border hover:border-primary/50",
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-primary">
        <Icone className="size-6" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold">{titulo}</span>
        <span className="block text-sm text-muted-foreground">{descricao}</span>
      </span>
    </button>
  );
}
