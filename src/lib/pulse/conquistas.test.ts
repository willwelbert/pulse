import { conquistasDesbloqueadas, novasConquistas } from "./conquistas";
import { descanso, regular, sequencia } from "./fixtures";

const ids = (checkIns: Parameters<typeof conquistasDesbloqueadas>[0]) =>
  conquistasDesbloqueadas(checkIns).map((c) => c.id);

describe("conquistasDesbloqueadas", () => {
  it("has none without check-ins", () => {
    expect(ids([])).toEqual([]);
  });

  it("unlocks Primeiro pulso on the first check-in", () => {
    expect(conquistasDesbloqueadas([regular("2026-10-06")])).toEqual([
      { id: "primeiro-pulso", desbloqueadaEm: "2026-10-06" },
    ]);
  });

  it("unlocks Primeiro descanso on the first Dia de descanso", () => {
    expect(ids([regular("2026-10-05"), descanso("2026-10-06")])).toContain("primeiro-descanso");
  });

  it("unlocks Semana no ritmo on the 5th check-in of a calendar week", () => {
    const desbloqueadas = conquistasDesbloqueadas(sequencia("2026-10-05", 5));
    expect(desbloqueadas).toContainEqual({ id: "semana-no-ritmo", desbloqueadaEm: "2026-10-09" });
  });

  it("does not count 5 check-ins split across two weeks", () => {
    // Fri 2026-10-02 → Tue 2026-10-06
    expect(ids(sequencia("2026-10-02", 5))).not.toContain("semana-no-ritmo");
  });

  it("unlocks 4 semanas no ritmo only for consecutive weeks", () => {
    const quatro = [
      ...sequencia("2026-09-14", 5),
      ...sequencia("2026-09-21", 5),
      ...sequencia("2026-09-28", 5),
      ...sequencia("2026-10-05", 5),
    ];
    expect(conquistasDesbloqueadas(quatro)).toContainEqual({
      id: "quatro-semanas-no-ritmo",
      desbloqueadaEm: "2026-10-09",
    });

    const comBuraco = [
      ...sequencia("2026-09-07", 5),
      ...sequencia("2026-09-14", 5),
      ...sequencia("2026-09-28", 5),
      ...sequencia("2026-10-05", 5),
    ];
    expect(ids(comBuraco)).not.toContain("quatro-semanas-no-ritmo");
  });

  it("unlocks De volta after 7 or more days without a check-in", () => {
    // gap of 7 empty days: 09-29 … 10-05
    expect(ids([regular("2026-09-28"), regular("2026-10-06")])).toContain("de-volta");
    // gap of 6 empty days
    expect(ids([regular("2026-09-29"), regular("2026-10-06")])).not.toContain("de-volta");
  });

  it("does not depend on the order the check-ins were saved", () => {
    const fora = [regular("2026-10-06"), regular("2026-10-05")];
    expect(conquistasDesbloqueadas(fora)).toEqual([
      { id: "primeiro-pulso", desbloqueadaEm: "2026-10-05" },
    ]);
  });
});

describe("novasConquistas", () => {
  it("returns what saving a check-in just unlocked", () => {
    const antes = sequencia("2026-10-05", 4);
    const depois = [...antes, regular("2026-10-09")];
    expect(novasConquistas(antes, depois).map((c) => c.id)).toEqual(["semana-no-ritmo"]);
  });
});
