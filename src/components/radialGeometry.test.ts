import {
  alvoNoPonto,
  CENTRO,
  fatiaNoAngulo,
  FUNDO,
  ESPESSURA,
  fatias,
  nivelPorDistancia,
  RAIO,
} from "./radialGeometry";

describe("fatias", () => {
  it("splits the quarter circle into 5 wedges, Humor nearest the thumb and Pressão on top", () => {
    expect(fatias.map((f) => f.dimensao)).toEqual(["humor", "energia", "motivacao", "clareza", "pressao"]);
    expect(fatias[0].inicio).toBe(180);
    expect(fatias[4].fim).toBe(270);
    expect(fatias.every((f) => f.fim - f.inicio === 18)).toBe(true);
  });
});

describe("nivelPorDistancia", () => {
  it("maps distance from the corner to a ring level", () => {
    expect(nivelPorDistancia(FUNDO + 1)).toBe(1);
    expect(nivelPorDistancia(FUNDO + ESPESSURA * 2.5)).toBe(3);
    expect(nivelPorDistancia(RAIO - 1)).toBe(5);
  });

  it("clamps inside the hole and beyond the edge", () => {
    expect(nivelPorDistancia(0)).toBe(1);
    expect(nivelPorDistancia(RAIO + 200)).toBe(5);
  });

  it("anchors the fan on the bottom-right corner", () => {
    expect(CENTRO).toEqual({ x: 360, y: 360 });
  });
});

describe("alvoNoPonto", () => {
  it("finds the wedge and level under a point", () => {
    // Straight left of the corner, middle of ring 3: Humor (180–198°)
    const r3 = FUNDO + ESPESSURA * 2.5;
    expect(alvoNoPonto({ x: CENTRO.x - r3, y: CENTRO.y - 1 })).toEqual({ dimensao: "humor", nivel: 3 });
    // Straight up from the corner: Pressão (252–270°)
    expect(alvoNoPonto({ x: CENTRO.x - 1, y: CENTRO.y - (RAIO - 5) })).toEqual({ dimensao: "pressao", nivel: 5 });
  });

  it("ignores points outside the quarter circle", () => {
    expect(alvoNoPonto({ x: 10, y: 10 })).toBeNull();
    expect(alvoNoPonto({ x: CENTRO.x - 50, y: CENTRO.y + 20 })).toBeNull();
  });

  it("clamps the angle while dragging, so a drag never escapes its wedge row", () => {
    expect(fatiaNoAngulo(179)?.dimensao).toBe("humor");
    expect(fatiaNoAngulo(271)?.dimensao).toBe("pressao");
  });
});
