import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import type { Dimensao, EstadoEmocional } from "@/lib/pulse/types";
import { RadialRating } from "./RadialRating";

function Controlado({ inicial = {} }: { inicial?: Partial<EstadoEmocional> }) {
  const [valores, setValores] = useState(inicial);
  return (
    <>
      <RadialRating
        valores={valores}
        ontem={false}
        onChange={(dimensao: Dimensao, nota: number) => setValores((v) => ({ ...v, [dimensao]: nota }))}
      />
      <output data-testid="valores">{JSON.stringify(valores)}</output>
    </>
  );
}

const valores = () => JSON.parse(screen.getByTestId("valores").textContent ?? "{}");

describe("RadialRating", () => {
  it("exposes one slider per dimension, bottom to top", () => {
    render(<Controlado />);
    expect(screen.getAllByRole("slider").map((s) => s.getAttribute("aria-label"))).toEqual([
      "Humor",
      "Energia",
      "Motivação",
      "Clareza",
      "Pressão",
    ]);
  });

  it("starts empty and changes a rating with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<Controlado />);
    const humor = screen.getByRole("slider", { name: "Humor" });
    expect(humor).toHaveAttribute("aria-valuetext", "Humor: sem resposta");

    humor.focus();
    await user.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}");
    expect(valores()).toEqual({ humor: 3 });
    expect(humor).toHaveAttribute("aria-valuenow", "3");
    expect(humor).toHaveAttribute("aria-valuetext", "Humor: Ok");

    await user.keyboard("{End}");
    expect(valores()).toEqual({ humor: 5 });
  });

  it("shows Pressão inverted: the outermost ring stores pressão 1", async () => {
    const user = userEvent.setup();
    render(<Controlado />);
    const pressao = screen.getByRole("slider", { name: "Pressão" });

    pressao.focus();
    await user.keyboard("{End}");
    expect(valores()).toEqual({ pressao: 1 });
    expect(pressao).toHaveAttribute("aria-valuenow", "5");
    expect(pressao).toHaveAttribute("aria-valuetext", "Pressão: Muito baixa");
  });

  it("asks how light the day was while Pressão is active", async () => {
    render(<Controlado />);
    screen.getByRole("slider", { name: "Pressão" }).focus();
    expect(await screen.findByText("Quão leve foi o dia?")).toBeInTheDocument();
  });

  it("shows saved values when editing", () => {
    render(<Controlado inicial={{ humor: 4, pressao: 2 }} />);
    expect(screen.getByRole("slider", { name: "Humor" })).toHaveAttribute("aria-valuenow", "4");
    expect(screen.getByRole("slider", { name: "Pressão" })).toHaveAttribute("aria-valuenow", "4");
  });
});
