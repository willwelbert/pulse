import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// The install state lives in its module, which listens from the moment it loads:
// each test gets a fresh copy.
async function renderSecao() {
  vi.resetModules();
  const { InstallSection } = await import("./InstallSection");
  return render(<InstallSection />);
}

function disparar(evento: Event) {
  act(() => {
    window.dispatchEvent(evento);
  });
}

describe("InstallSection", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows the steps by hand until the browser offers its install dialog", async () => {
    await renderSecao();

    expect(screen.getByText(/Adicionar à Tela de Início/)).toBeInTheDocument();
    expect(screen.getByText(/toque em Instalar app/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /instalar o pulse/i })).not.toBeInTheDocument();
  });

  it("opens the browser's install dialog, which only works once per event", async () => {
    const user = userEvent.setup();
    await renderSecao();
    const pedido = Object.assign(new Event("beforeinstallprompt"), {
      prompt: vi.fn().mockResolvedValue({ outcome: "dismissed" }),
    });

    disparar(pedido);
    await user.click(screen.getByRole("button", { name: /instalar o pulse/i }));

    expect(pedido.prompt).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: /instalar o pulse/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Adicionar à Tela de Início/)).toBeInTheDocument();
  });

  it("says it is installed once the browser finishes installing", async () => {
    await renderSecao();

    disparar(new Event("appinstalled"));

    expect(screen.getByText(/está instalado neste aparelho/)).toBeInTheDocument();
  });

  it("says it is installed when opened from the home screen", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query) => ({ matches: query === "(display-mode: standalone)" }) as MediaQueryList,
    );

    await renderSecao();

    expect(screen.getByText(/está instalado neste aparelho/)).toBeInTheDocument();
    expect(screen.queryByText(/Adicionar à Tela de Início/)).not.toBeInTheDocument();
  });
});
