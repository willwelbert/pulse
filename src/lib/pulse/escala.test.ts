import { nivelVisual, notaDoNivel } from "./escala";

describe("escala visual", () => {
  it("keeps every dimension but Pressão as answered", () => {
    expect(nivelVisual("humor", 4)).toBe(4);
    expect(notaDoNivel("clareza", 2)).toBe(2);
  });

  it("inverts Pressão so further out is always better", () => {
    expect(nivelVisual("pressao", 1)).toBe(5);
    expect(nivelVisual("pressao", 5)).toBe(1);
    expect(notaDoNivel("pressao", 5)).toBe(1);
  });

  it("round-trips every rating", () => {
    for (const nota of [1, 2, 3, 4, 5]) {
      expect(notaDoNivel("pressao", nivelVisual("pressao", nota))).toBe(nota);
    }
  });
});
