import { descanso, regular, sequencia } from "./fixtures";
import { META_SEMANAL, ritmoDaSemana, semanasSeguidasNoRitmo } from "./ritmo";

describe("ritmoDaSemana", () => {
  // Week of 2026-10-05 (Mon) to 2026-10-11 (Sun)
  it("counts check-ins in the calendar week, Dias de descanso included", () => {
    const ritmo = ritmoDaSemana(
      [regular("2026-10-04"), regular("2026-10-05"), descanso("2026-10-06")],
      "2026-10-07",
    );
    expect(ritmo).toMatchObject({
      inicio: "2026-10-05",
      registrados: 2,
      faltam: META_SEMANAL - 2,
      atingido: false,
      aindaPossivel: true,
    });
  });

  it("is reached at 5 of 7", () => {
    const ritmo = ritmoDaSemana(sequencia("2026-10-05", 5), "2026-10-09");
    expect(ritmo).toMatchObject({ registrados: 5, faltam: 0, atingido: true });
  });

  it("knows when the goal is no longer reachable this week", () => {
    // Saturday with only 1 check-in: today and Sunday left → at most 3
    const ritmo = ritmoDaSemana([regular("2026-10-05")], "2026-10-10");
    expect(ritmo.aindaPossivel).toBe(false);
  });

  it("lists the 7 days of the week with their check-in", () => {
    const ritmo = ritmoDaSemana([regular("2026-10-06")], "2026-10-06");
    expect(ritmo.dias.map((d) => d.date)).toEqual([
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
      "2026-10-10",
      "2026-10-11",
    ]);
    expect(ritmo.dias[1].checkIn?.date).toBe("2026-10-06");
    expect(ritmo.dias[0].checkIn).toBeNull();
  });
});

describe("semanasSeguidasNoRitmo", () => {
  it("is 0 with no history", () => {
    expect(semanasSeguidasNoRitmo([], "2026-10-06")).toBe(0);
  });

  it("counts consecutive finished weeks, not breaking on the week still in progress", () => {
    const historico = [
      ...sequencia("2026-09-21", 5),
      ...sequencia("2026-09-28", 5),
      regular("2026-10-05"),
    ];
    expect(semanasSeguidasNoRitmo(historico, "2026-10-06")).toBe(2);
  });

  it("includes the current week once it reaches the goal", () => {
    const historico = [...sequencia("2026-09-28", 5), ...sequencia("2026-10-05", 5)];
    expect(semanasSeguidasNoRitmo(historico, "2026-10-09")).toBe(2);
  });

  it("stops at a week that missed the goal", () => {
    const historico = [
      ...sequencia("2026-09-14", 5),
      ...sequencia("2026-09-21", 4),
      ...sequencia("2026-09-28", 5),
    ];
    expect(semanasSeguidasNoRitmo(historico, "2026-10-06")).toBe(1);
  });
});
