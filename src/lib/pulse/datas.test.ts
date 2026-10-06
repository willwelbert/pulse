import { addDays, daysBetween, inicioDaSemana } from "./datas";

describe("datas", () => {
  it("adds days across month boundaries", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-10-01", -1)).toBe("2026-09-30");
  });

  it("counts days between two dates", () => {
    expect(daysBetween("2026-10-01", "2026-10-06")).toBe(5);
    expect(daysBetween("2026-10-06", "2026-10-01")).toBe(-5);
  });

  it("starts the week on Monday", () => {
    // 2026-10-06 is a Tuesday
    expect(inicioDaSemana("2026-10-06")).toBe("2026-10-05");
    expect(inicioDaSemana("2026-10-05")).toBe("2026-10-05");
    // Sunday belongs to the week that started the previous Monday
    expect(inicioDaSemana("2026-10-11")).toBe("2026-10-05");
  });
});
