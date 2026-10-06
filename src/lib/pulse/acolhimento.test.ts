import { modoAcolhimento, tomDaConclusao } from "./acolhimento";
import { descanso, EMOCIONAL_BOM, EMOCIONAL_TENSO, regular } from "./fixtures";

describe("modoAcolhimento", () => {
  const hoje = "2026-10-06";

  it("turns on when the 3 most recent check-ins have Pressão ≥ 4", () => {
    const checkIns = [
      regular("2026-10-01", EMOCIONAL_BOM),
      regular("2026-10-02", EMOCIONAL_TENSO),
      regular("2026-10-04", { ...EMOCIONAL_BOM, pressao: 4 }),
      regular(hoje, EMOCIONAL_TENSO),
    ];
    expect(modoAcolhimento(checkIns, hoje)).toBe(true);
  });

  it("counts check-ins, so an empty day in between does not reset the signal", () => {
    const checkIns = [
      regular("2026-10-01", EMOCIONAL_TENSO),
      regular("2026-10-03", EMOCIONAL_TENSO),
      regular("2026-10-05", EMOCIONAL_TENSO),
    ];
    expect(modoAcolhimento(checkIns, hoje)).toBe(true);
  });

  it("stays off with fewer than 3 check-ins", () => {
    expect(modoAcolhimento([regular("2026-10-05", EMOCIONAL_TENSO), regular(hoje, EMOCIONAL_TENSO)], hoje)).toBe(false);
  });

  it("only looks at the last 7 days", () => {
    const checkIns = [
      regular("2026-09-28", EMOCIONAL_TENSO),
      regular("2026-10-05", EMOCIONAL_TENSO),
      regular(hoje, EMOCIONAL_TENSO),
    ];
    expect(modoAcolhimento(checkIns, hoje)).toBe(false);
  });

  it("turns off once a Dia de descanso is among the 3 most recent", () => {
    const checkIns = [
      regular("2026-10-03", EMOCIONAL_TENSO),
      regular("2026-10-04", EMOCIONAL_TENSO),
      regular("2026-10-05", EMOCIONAL_TENSO),
      descanso(hoje),
    ];
    expect(modoAcolhimento(checkIns, hoje)).toBe(false);
  });
});

describe("tomDaConclusao", () => {
  it("celebrates a regular day", () => {
    expect(tomDaConclusao(regular("2026-10-06"), false)).toBe("celebrar");
  });

  it("is gentle when that day's Pulse Diário is below 40", () => {
    expect(tomDaConclusao(regular("2026-10-06", EMOCIONAL_TENSO), false)).toBe("acolher");
  });

  it("is gentle while Modo acolhimento is on", () => {
    expect(tomDaConclusao(regular("2026-10-06"), true)).toBe("acolher");
  });

  it("acknowledges a Dia de descanso", () => {
    expect(tomDaConclusao(descanso("2026-10-06"), true)).toBe("descanso");
  });
});
