import { hoje as hojeDoRelogio } from "@/lib/clock";
import { novasConquistas } from "@/lib/pulse/conquistas";
import { addDays } from "@/lib/pulse/datas";
import type { CheckIn } from "@/lib/pulse/types";
import {
  checkInSchema,
  type CheckInSalvo,
  dashboardSchema,
  desembrulhar,
  hojeSchema,
  type PulseDashboard,
  type PulseHoje,
  salvarCheckInSchema,
} from "@/utils/adapters/pulseAdapter";
import { campanhasAtivasNoRadar, gravarCheckIns, lerCheckIns } from "@/utils/mock/store";

/**
 * Fake api.added.today/pulse/*: answers with the same envelope the real API
 * uses, serialized as JSON, so the adapters parse exactly what they would in prod.
 */
const LATENCIA_MS = 200;

async function responder(corpo: unknown): Promise<unknown> {
  await new Promise((r) => setTimeout(r, LATENCIA_MS));
  return JSON.parse(JSON.stringify(corpo));
}

const ok = (data: unknown) => responder({ success: true, data });
const erro = (code: string, message: string) => responder({ success: false, errors: [{ code, message }] });

function ultimoMinutosTrabalhados(checkIns: CheckIn[]): number | null {
  const comTempo = checkIns
    .filter((c) => c.operacional)
    .sort((a, b) => b.date.localeCompare(a.date));
  return comTempo[0]?.operacional?.minutosTrabalhados ?? null;
}

/** GET /pulse/today */
export async function getPulseHoje(): Promise<PulseHoje> {
  const hoje = hojeDoRelogio();
  const ontem = addDays(hoje, -1);
  const checkIns = lerCheckIns();
  const resposta = await ok({
    hoje,
    ontem,
    checkInHoje: checkIns.find((c) => c.date === hoje) ?? null,
    checkInOntem: checkIns.find((c) => c.date === ontem) ?? null,
    ultimoMinutosTrabalhados: ultimoMinutosTrabalhados(checkIns),
  });
  return desembrulhar(hojeSchema, resposta);
}

/** GET /pulse/dashboard */
export async function getPulseDashboard(): Promise<PulseDashboard> {
  const resposta = await ok({
    hoje: hojeDoRelogio(),
    checkIns: lerCheckIns(),
    campanhasAtivas: campanhasAtivasNoRadar(),
  });
  return desembrulhar(dashboardSchema, resposta);
}

/** PUT /pulse/check-in */
export async function putCheckIn(entrada: CheckIn): Promise<CheckInSalvo> {
  const hoje = hojeDoRelogio();
  const validado = checkInSchema.safeParse(entrada);

  let resposta: unknown;
  if (!validado.success) {
    resposta = await erro("VALIDACAO", validado.error.issues[0].message);
  } else if (![hoje, addDays(hoje, -1)].includes(validado.data.date)) {
    resposta = await erro("DATA_INVALIDA", "Só é possível registrar hoje ou ontem.");
  } else {
    const antes = lerCheckIns();
    const depois = [...antes.filter((c) => c.date !== validado.data.date), validado.data];
    gravarCheckIns(depois);
    resposta = await ok({ checkIn: validado.data, novasConquistas: novasConquistas(antes, depois) });
  }
  return desembrulhar(salvarCheckInSchema, resposta);
}
