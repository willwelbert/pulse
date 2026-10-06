import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HOLD_MS, PulseHoldButton } from "./PulseHoldButton";

function renderBotao(props: Partial<React.ComponentProps<typeof PulseHoldButton>> = {}) {
  const onAbrir = vi.fn();
  const onConfirmar = vi.fn();
  render(
    <PulseHoldButton aberto={false} respondidas={0} onAbrir={onAbrir} onConfirmar={onConfirmar} {...props} />,
  );
  return { onAbrir, onConfirmar };
}

describe("PulseHoldButton", () => {
  afterEach(() => vi.useRealTimers());

  it("shows only the pulse icon, keeping the hold instruction for screen readers", () => {
    renderBotao();
    const botao = screen.getByRole("button", { name: "Check-in rápido. Segure para abrir." });
    expect(botao).toHaveTextContent("");
  });

  it("opens after holding long enough", () => {
    vi.useFakeTimers();
    const { onAbrir } = renderBotao();
    const botao = screen.getByRole("button", { name: /segure para abrir/i });

    fireEvent.pointerDown(botao);
    act(() => vi.advanceTimersByTime(HOLD_MS - 100));
    expect(onAbrir).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(100));
    expect(onAbrir).toHaveBeenCalledOnce();
  });

  it("does not treat the release that ends the hold as a confirm", () => {
    vi.useFakeTimers();
    const onConfirmar = vi.fn();
    const { rerender } = render(
      <PulseHoldButton aberto={false} respondidas={5} onAbrir={vi.fn()} onConfirmar={onConfirmar} />,
    );
    const botao = screen.getByRole("button", { name: /segure para abrir/i });
    fireEvent.pointerDown(botao);
    act(() => vi.advanceTimersByTime(HOLD_MS));
    rerender(<PulseHoldButton aberto respondidas={5} onAbrir={vi.fn()} onConfirmar={onConfirmar} />);
    fireEvent.pointerUp(botao);
    fireEvent.click(botao, { detail: 1 });
    expect(onConfirmar).not.toHaveBeenCalled();

    fireEvent.click(botao, { detail: 1 });
    expect(onConfirmar).toHaveBeenCalledOnce();
  });

  it("does not open when released early, and asks to keep holding", () => {
    vi.useFakeTimers();
    const { onAbrir } = renderBotao();
    const botao = screen.getByRole("button", { name: /segure para abrir/i });

    fireEvent.pointerDown(botao);
    act(() => vi.advanceTimersByTime(400));
    fireEvent.pointerUp(botao);
    act(() => vi.advanceTimersByTime(HOLD_MS));

    expect(onAbrir).not.toHaveBeenCalled();
    expect(screen.getByText("Continue segurando")).toBeInTheDocument();
  });

  it("opens straight away from the keyboard", async () => {
    const user = userEvent.setup();
    const { onAbrir } = renderBotao();
    screen.getByRole("button", { name: /segure para abrir/i }).focus();
    await user.keyboard("{Enter}");
    expect(onAbrir).toHaveBeenCalledOnce();
  });

  it("becomes the fan's hub, showing progress until all 5 are answered", () => {
    renderBotao({ aberto: true, respondidas: 3 });
    expect(screen.getByRole("button", { name: /3 de 5/i })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("3/5")).toBeInTheDocument();
  });

  it("does not confirm before all 5 are answered", async () => {
    const user = userEvent.setup();
    const { onConfirmar } = renderBotao({ aberto: true, respondidas: 4 });
    await user.click(screen.getByRole("button", { name: /4 de 5/i }));
    expect(onConfirmar).not.toHaveBeenCalled();
  });

  it("puts an iOS haptic switch under the finger", () => {
    renderBotao();
    expect(document.querySelector("label[data-haptic-trigger] input[switch]")).not.toBeNull();
  });

  it("confirms with a tap at 5 of 5", async () => {
    const user = userEvent.setup();
    const { onConfirmar } = renderBotao({ aberto: true, respondidas: 5 });
    await user.click(screen.getByRole("button", { name: /continuar/i }));
    expect(onConfirmar).toHaveBeenCalledOnce();
  });
});
