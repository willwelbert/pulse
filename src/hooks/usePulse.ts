import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { modoAcolhimento } from "@/lib/pulse/acolhimento";
import { conquistasDesbloqueadas } from "@/lib/pulse/conquistas";
import { linhaDePulso } from "@/lib/pulse/linha";
import { ritmoDaSemana, semanasSeguidasNoRitmo } from "@/lib/pulse/ritmo";
import { pulseScore } from "@/lib/pulse/score";
import { getPulseDashboard, getPulseHoje, putCheckIn } from "@/utils/mock/api";

export const pulseKeys = {
  all: ["pulse"] as const,
  hoje: ["pulse", "today"] as const,
  dashboard: ["pulse", "dashboard"] as const,
};

/** GET /pulse/today */
export function usePulseHoje() {
  return useQuery({ queryKey: pulseKeys.hoje, queryFn: getPulseHoje });
}

/** GET /pulse/dashboard, with every domain rule applied to the history. */
export function usePulseDashboard() {
  const query = useQuery({ queryKey: pulseKeys.dashboard, queryFn: getPulseDashboard });

  const painel = useMemo(() => {
    if (!query.data) return null;
    const { hoje, checkIns, campanhasAtivas } = query.data;
    return {
      hoje,
      checkIns,
      campanhasAtivas,
      score: pulseScore(checkIns, hoje),
      ritmo: ritmoDaSemana(checkIns, hoje),
      semanasSeguidas: semanasSeguidasNoRitmo(checkIns, hoje),
      conquistas: conquistasDesbloqueadas(checkIns),
      acolhimento: modoAcolhimento(checkIns, hoje),
      linha: linhaDePulso(checkIns, hoje, 14),
    };
  }, [query.data]);

  return { ...query, painel };
}

export type Painel = NonNullable<ReturnType<typeof usePulseDashboard>["painel"]>;

/** PUT /pulse/check-in */
export function useSalvarCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: putCheckIn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pulseKeys.all }),
  });
}
