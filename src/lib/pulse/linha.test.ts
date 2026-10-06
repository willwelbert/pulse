import { descanso, EMOCIONAL_BOM, regular } from "./fixtures";
import { estadoDoDia, linhaDePulso } from "./linha";

describe("estadoDoDia", () => {
  it("is vazio without a check-in", () => {
    expect(estadoDoDia(null)).toBe("vazio");
  });

  it("is tenso when Pressão ≥ 4", () => {
    expect(estadoDoDia(regular("2026-10-06", { ...EMOCIONAL_BOM, pressao: 4 }))).toBe("tenso");
  });

  it("is comum otherwise", () => {
    expect(estadoDoDia(regular("2026-10-06"))).toBe("comum");
  });

  it("is descanso for a Dia de descanso, even with high Pressão", () => {
    expect(estadoDoDia(descanso("2026-10-06", { ...EMOCIONAL_BOM, pressao: 5 }))).toBe("descanso");
  });
});

describe("linhaDePulso", () => {
  it("returns one beat per day, oldest first, ending today", () => {
    const linha = linhaDePulso([regular("2026-10-06"), descanso("2026-10-04")], "2026-10-06", 4);
    expect(linha).toEqual([
      { date: "2026-10-03", estado: "vazio" },
      { date: "2026-10-04", estado: "descanso" },
      { date: "2026-10-05", estado: "vazio" },
      { date: "2026-10-06", estado: "comum" },
    ]);
  });
});
