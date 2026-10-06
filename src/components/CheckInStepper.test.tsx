import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
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

  it("walks a regular day one question per screen and saves it", async () => {
    const user = userEvent.setup();
    renderStepper(pulse());

    await user.click(screen.getByRole("button", { name: /dia normal/i }));
    const respostas: [RegExp, string][] = [
      [/humor/, "5"],
      [/energia/, "4"],
      [/motivação/, "5"],
      [/pressão/, "2"],
      [/clareza/, "4"],
    ];
    for (const [pergunta, nota] of respostas) {
      const grupo = await screen.findByRole("radiogroup", { name: pergunta });
      await user.click(within(grupo).getByRole("radio", { name: new RegExp(`^${nota} —`) }));
    }

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
