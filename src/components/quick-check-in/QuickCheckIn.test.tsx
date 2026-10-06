import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { definirHoje, resetarRelogio } from "@/lib/clock";
import { regular } from "@/lib/pulse/fixtures";
import { gravarCheckIns, lerCheckIns } from "@/utils/mock/store";
import { QuickCheckIn } from "./QuickCheckIn";

let pathname = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

const HOJE = "2026-10-06";

function renderWidget() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <QuickCheckIn />
    </QueryClientProvider>,
  );
}

async function preencherLeque(user: ReturnType<typeof userEvent.setup>) {
  screen.getByRole("button", { name: /segure para abrir/i }).focus();
  await user.keyboard("{Enter}");
  expect(await screen.findByRole("dialog", { name: "Check-in rápido" })).toBeInTheDocument();
  for (const [nome, nivel] of [
    ["Humor", 5],
    ["Energia", 4],
    ["Motivação", 5],
    ["Clareza", 4],
    ["Pressão", 4],
  ] as const) {
    screen.getByRole("slider", { name: nome }).focus();
    await user.keyboard("{End}" + "{ArrowDown}".repeat(5 - nivel));
  }
  await user.click(screen.getByRole("button", { name: /continuar para os indicadores/i }));
  expect(await screen.findByText("Falta pouco")).toBeInTheDocument();
}

describe("QuickCheckIn", () => {
  beforeEach(() => {
    pathname = "/";
    localStorage.clear();
    definirHoje(HOJE);
  });
  afterAll(() => resetarRelogio());

  it("records today from the fan, then the drawer", async () => {
    const user = userEvent.setup();
    renderWidget();
    await screen.findByRole("button", { name: /segure para abrir/i });

    await preencherLeque(user);
    await user.click(screen.getByRole("button", { name: "Salvar check-in" }));

    expect(await screen.findByText("Pulso registrado")).toBeInTheDocument();
    expect(lerCheckIns()).toEqual([
      {
        date: HOJE,
        tipo: "regular",
        emocional: { humor: 5, energia: 4, motivacao: 5, clareza: 4, pressao: 2 },
        operacional: { conteudos: 0, reunioes: 0, minutosTrabalhados: 0 },
      },
    ]);
  });

  it("keeps today's operational data when redoing the emotional part", async () => {
    const operacional = { conteudos: 3, reunioes: 2, minutosTrabalhados: 390 };
    gravarCheckIns([{ ...regular(HOJE), operacional }]);
    const user = userEvent.setup();
    renderWidget();
    await screen.findByRole("button", { name: /segure para abrir/i });

    await preencherLeque(user);
    expect(screen.getByText("6h30")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Salvar check-in" }));

    await screen.findByText("Pulso registrado");
    expect(lerCheckIns()[0].operacional).toEqual(operacional);
  });

  it.each(["/check-in", "/check-in/"])("is hidden on the full check-in page (%s)", async (rota) => {
    pathname = rota;
    renderWidget();
    await new Promise((r) => setTimeout(r, 300));
    expect(screen.queryByRole("button", { name: /segure para abrir/i })).not.toBeInTheDocument();
  });
});
