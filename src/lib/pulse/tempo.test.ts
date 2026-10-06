import { ajustarTempo, formatarTempo, TEMPO_MAXIMO } from "./tempo";

describe("ajustarTempo", () => {
  it("applies relative shortcuts", () => {
    expect(ajustarTempo(300, 30)).toBe(330);
    expect(ajustarTempo(300, -60)).toBe(240);
  });

  it("never goes below 0 or above the maximum", () => {
    expect(ajustarTempo(20, -30)).toBe(0);
    expect(ajustarTempo(TEMPO_MAXIMO, 60)).toBe(TEMPO_MAXIMO);
  });
});

describe("formatarTempo", () => {
  it("formats whole and half hours", () => {
    expect(formatarTempo(0)).toBe("0h");
    expect(formatarTempo(300)).toBe("5h");
    expect(formatarTempo(330)).toBe("5h30");
    expect(formatarTempo(30)).toBe("30min");
  });
});
