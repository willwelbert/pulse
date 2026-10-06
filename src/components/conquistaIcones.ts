import { Activity, CalendarCheck, HeartHandshake, Moon, Trophy, type LucideIcon } from "lucide-react";
import type { ConquistaId } from "@/lib/pulse/conquistas";

export const ICONES_CONQUISTAS: Record<ConquistaId, LucideIcon> = {
  "primeiro-pulso": Activity,
  "semana-no-ritmo": CalendarCheck,
  "quatro-semanas-no-ritmo": Trophy,
  "primeiro-descanso": Moon,
  "de-volta": HeartHandshake,
};
