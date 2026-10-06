import { descanso, EMOCIONAL_BOM, regular, sequencia } from "./fixtures";
import { pulseDiario, pulseScore } from "./score";

describe("pulseDiario", () => {
  it("matches the current app: 5,4,5 pressão 2,4 → 85", () => {
    expect(pulseDiario(EMOCIONAL_BOM)).toBe(85);
  });

  it("inverts Pressão: all best ratings give 100", () => {
    expect(pulseDiario({ humor: 5, energia: 5, motivacao: 5, pressao: 1, clareza: 5 })).toBe(100);
  });

  it("all worst ratings give 0", () => {
    expect(pulseDiario({ humor: 1, energia: 1, motivacao: 1, pressao: 5, clareza: 1 })).toBe(0);
  });
});

describe("pulseScore", () => {
  const hoje = "2026-10-06";

  it("is empty with no check-ins", () => {
    expect(pulseScore([], hoje)).toEqual({ estado: "vazio", valor: null, diasRegistrados: 0 });
  });

  it("is a retrato inicial below 3 check-ins", () => {
    const score = pulseScore([regular(hoje)], hoje);
    expect(score).toEqual({ estado: "retrato-inicial", valor: 85, diasRegistrados: 1 });
  });

  it("averages Pulse Diário over registered days only — missing days are not zero", () => {
    const score = pulseScore(
      [
        regular("2026-10-01", { humor: 5, energia: 5, motivacao: 5, pressao: 1, clareza: 5 }),
        regular("2026-10-03", { humor: 3, energia: 3, motivacao: 3, pressao: 3, clareza: 3 }),
        regular(hoje, { humor: 1, energia: 1, motivacao: 1, pressao: 5, clareza: 1 }),
      ],
      hoje,
    );
    expect(score).toEqual({ estado: "pronto", valor: 50, diasRegistrados: 3 });
  });

  it("ignores check-ins outside the last 7 days", () => {
    const score = pulseScore([regular("2026-09-29"), ...sequencia("2026-09-30", 1)], hoje);
    expect(score.diasRegistrados).toBe(1);
  });

  it("counts a Dia de descanso as registered but leaves it out of the average without emotional state", () => {
    const score = pulseScore(
      [descanso("2026-10-04"), regular("2026-10-05"), regular(hoje)],
      hoje,
    );
    expect(score).toEqual({ estado: "pronto", valor: 85, diasRegistrados: 3 });
  });

  it("includes a Dia de descanso that has emotional state", () => {
    const score = pulseScore(
      [descanso("2026-10-04", { humor: 3, energia: 3, motivacao: 3, pressao: 3, clareza: 3 }), regular(hoje)],
      hoje,
    );
    expect(score.valor).toBe(68);
  });
});
