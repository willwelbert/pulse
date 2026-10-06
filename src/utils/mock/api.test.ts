import { definirHoje, resetarRelogio } from "@/lib/clock";
import { regular } from "@/lib/pulse/fixtures";
import { getPulseHoje, putCheckIn } from "@/utils/mock/api";
import { gravarCheckIns } from "@/utils/mock/store";

describe("mock api", () => {
  beforeEach(() => {
    localStorage.clear();
    definirHoje("2026-10-06");
  });
  afterAll(() => resetarRelogio());

  it("saves today's check-in and reports what it unlocked", async () => {
    const salvo = await putCheckIn(regular("2026-10-06"));
    expect(salvo.novasConquistas.map((c) => c.id)).toEqual(["primeiro-pulso"]);
    expect((await getPulseHoje()).checkInHoje?.date).toBe("2026-10-06");
  });

  it("accepts yesterday but nothing older", async () => {
    await expect(putCheckIn(regular("2026-10-05"))).resolves.toBeDefined();
    await expect(putCheckIn(regular("2026-10-04"))).rejects.toMatchObject({ code: "DATA_INVALIDA" });
  });

  it("replaces an existing check-in for the same day", async () => {
    gravarCheckIns([regular("2026-10-06")]);
    const salvo = await putCheckIn({ ...regular("2026-10-06"), tipo: "descanso" });
    expect(salvo.checkIn.tipo).toBe("descanso");
    expect(salvo.novasConquistas.map((c) => c.id)).toEqual(["primeiro-descanso"]);
  });

  it("pre-fills Tempo trabalhado from the latest check-in", async () => {
    gravarCheckIns([
      { ...regular("2026-10-03"), operacional: { conteudos: 1, reunioes: 0, minutosTrabalhados: 240 } },
      { ...regular("2026-10-05"), operacional: { conteudos: 2, reunioes: 1, minutosTrabalhados: 330 } },
    ]);
    expect((await getPulseHoje()).ultimoMinutosTrabalhados).toBe(330);
  });
});
