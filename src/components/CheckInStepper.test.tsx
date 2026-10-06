import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { definirHoje, resetarRelogio } from "@/lib/clock";
import { regular } from "@/lib/pulse/fixtures";
import type { PulseHoje } from "@/utils/adapters/pulseAdapter";
import { gravarCheckIns, lerCheckIns } from "@/utils/mock/store";
import { CheckInStepper } from "./CheckInStepper";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const HOJE = "2026-10-06";

function pulse(parcial: Partial<PulseHoje> = {}): PulseHoje {
  return {
    hoje: HOJE,
    ontem: "2026-10-05",
    checkInHoje: null,
    checkInOntem: regular("2026-10-05"),
    ultimoMinutosTrabalhados: 300,
    ...parcial,
  };
}

function renderStepper(dados: PulseHoje) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <CheckInStepper pulse={dados} tipoInicial={null} />
    </QueryClientProvider>,
  );
}

describe("CheckInStepper", () => {
  beforeEach(() => {
    localStorage.clear();
    definirHoje(HOJE);
    gravarCheckIns([regular("2026-10-05")]);
  });
  afterAll(() => resetarRelogio());

  it("fills the emotional state on the fan, then the operational step, and saves", async () => {
    const user = userEvent.setup();
    renderStepper(pulse());

    await user.click(screen.getByRole("button", { name: /dia normal/i }));
    // Visual levels on the fan: Pressão is inverted, so level 4 stores pressão 2.
    const niveis: [string, number][] = [
      ["Humor", 5],
      ["Energia", 4],
      ["Motivação", 5],
      ["Clareza", 4],
      ["Pressão", 4],
    ];
    await screen.findByRole("slider", { name: "Humor" });
    const continuar = screen.getByRole("button", { name: "Continuar" });
    for (const [nome, nivel] of niveis) {
      expect(continuar).toBeDisabled();
      screen.getByRole("slider", { name: nome }).focus();
      await user.keyboard("{ArrowUp}".repeat(nivel));
    }
    await user.click(continuar);

    expect(await screen.findByText("5h")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Somar 30min" }));
    expect(screen.getByText("5h30")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Salvar check-in" }));

    expect(await screen.findByText("Pulso registrado")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(lerCheckIns().find((c) => c.date === HOJE)).toMatchObject({
      tipo: "regular",
      emocional: { humor: 5, energia: 4, motivacao: 5, pressao: 2, clareza: 4 },
      operacional: { conteudos: 0, reunioes: 0, minutosTrabalhados: 330 },
    });
  });

  it("saves a Dia de descanso without emotional state or operational data", async () => {
    const user = userEvent.setup();
    renderStepper(pulse());

    await user.click(screen.getByRole("button", { name: /dia de descanso/i }));
    await user.click(await screen.findByRole("button", { name: /só o descanso/i }));

    expect(await screen.findByText("Descanso registrado")).toBeInTheDocument();
    expect(lerCheckIns().find((c) => c.date === HOJE)).toEqual({
      date: HOJE,
      tipo: "descanso",
      emocional: null,
      operacional: null,
    });
  });

  it("asks which day only when yesterday is still empty", async () => {
    renderStepper(pulse({ checkInOntem: null }));
    expect(screen.getByRole("heading", { name: /de qual dia/i })).toBeInTheDocument();
  });
});
