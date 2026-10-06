import { ApiError, checkInSchema, desembrulhar, hojeSchema } from "@/utils/adapters/pulseAdapter";

const emocional = { humor: 5, energia: 4, motivacao: 5, pressao: 2, clareza: 4 };

describe("checkInSchema", () => {
  it("requires the emotional state on a regular check-in", () => {
    const r = checkInSchema.safeParse({ date: "2026-10-06", tipo: "regular", emocional: null, operacional: null });
    expect(r.success).toBe(false);
  });

  it("allows a Dia de descanso without emotional state", () => {
    const r = checkInSchema.safeParse({ date: "2026-10-06", tipo: "descanso", emocional: null, operacional: null });
    expect(r.success).toBe(true);
  });

  it("rejects ratings outside 1–5", () => {
    const r = checkInSchema.safeParse({
      date: "2026-10-06",
      tipo: "regular",
      emocional: { ...emocional, pressao: 6 },
      operacional: null,
    });
    expect(r.success).toBe(false);
  });
});

describe("desembrulhar", () => {
  const hoje = {
    hoje: "2026-10-06",
    ontem: "2026-10-05",
    checkInHoje: null,
    checkInOntem: null,
    ultimoMinutosTrabalhados: 300,
  };

  it("returns data from a success envelope", () => {
    expect(desembrulhar(hojeSchema, { success: true, data: hoje })).toEqual(hoje);
  });

  it("throws the first API error from a failure envelope", () => {
    const falha = { success: false, errors: [{ code: "UNAUTHORIZED", message: "Não autorizado." }] };
    expect(() => desembrulhar(hojeSchema, falha)).toThrow(new ApiError("UNAUTHORIZED", "Não autorizado."));
  });

  it("throws when the payload does not match the schema", () => {
    expect(() => desembrulhar(hojeSchema, { success: true, data: { hoje: "ontem" } })).toThrow();
  });
});
