import { z } from "zod";
import type { CheckIn } from "@/lib/pulse/types";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const nota = z.number().int().min(1).max(5);

export const estadoEmocionalSchema = z.object({
  humor: nota,
  energia: nota,
  motivacao: nota,
  pressao: nota,
  clareza: nota,
});

export const indicadoresSchema = z.object({
  conteudos: z.number().int().min(0),
  reunioes: z.number().int().min(0),
  minutosTrabalhados: z.number().int().min(0),
});

export const checkInSchema = z
  .object({
    date: isoDate,
    tipo: z.enum(["regular", "descanso"]),
    emocional: estadoEmocionalSchema.nullable(),
    operacional: indicadoresSchema.nullable(),
  })
  .refine((c) => c.tipo === "descanso" || c.emocional !== null, {
    message: "Check-in regular precisa do estado emocional.",
    path: ["emocional"],
  }) satisfies z.ZodType<CheckIn>;

const erroSchema = z.object({ code: z.string(), message: z.string() });

type Envelope<T> = { success: true; data: T } | { success: false; errors: z.infer<typeof erroSchema>[] };

/** The `{ success, data | errors }` envelope used by api.added.today. */
export function envelopeSchema<T extends z.ZodType>(data: T) {
  return z.discriminatedUnion("success", [
    z.object({ success: z.literal(true), data }),
    z.object({ success: z.literal(false), errors: z.array(erroSchema).min(1) }),
  ]);
}

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function desembrulhar<T extends z.ZodType>(schema: T, resposta: unknown): z.infer<T> {
  const envelope = envelopeSchema(schema).parse(resposta) as Envelope<z.infer<T>>;
  if (!envelope.success) {
    const [primeiro] = envelope.errors;
    throw new ApiError(primeiro.code, primeiro.message);
  }
  return envelope.data;
}

export const hojeSchema = z.object({
  hoje: isoDate,
  ontem: isoDate,
  checkInHoje: checkInSchema.nullable(),
  checkInOntem: checkInSchema.nullable(),
  ultimoMinutosTrabalhados: z.number().int().min(0).nullable(),
});
export type PulseHoje = z.infer<typeof hojeSchema>;

export const dashboardSchema = z.object({
  hoje: isoDate,
  checkIns: z.array(checkInSchema),
  campanhasAtivas: z.number().int().min(0),
});
export type PulseDashboard = z.infer<typeof dashboardSchema>;

export const salvarCheckInSchema = z.object({
  checkIn: checkInSchema,
  novasConquistas: z.array(z.object({ id: z.string(), desbloqueadaEm: isoDate })),
});
export type CheckInSalvo = z.infer<typeof salvarCheckInSchema>;
