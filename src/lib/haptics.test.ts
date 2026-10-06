import { batimento, sucesso, tique } from "./haptics";

describe("haptics", () => {
  afterEach(() => {
    // @ts-expect-error test cleanup
    delete navigator.vibrate;
  });

  it("uses navigator.vibrate where available (Android)", () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true });

    tique();
    batimento();
    sucesso();

    expect(vibrate).toHaveBeenNthCalledWith(1, 8);
    expect(vibrate).toHaveBeenNthCalledWith(2, [18, 110, 26]);
    expect(vibrate).toHaveBeenNthCalledWith(3, [30, 60, 30]);
  });

  it("is a no-op without navigator.vibrate (iPhone)", () => {
    expect(() => {
      tique();
      batimento();
      sucesso();
    }).not.toThrow();
  });
});
