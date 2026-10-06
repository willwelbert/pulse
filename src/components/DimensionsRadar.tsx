"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { nivelVisual } from "@/lib/pulse/escala";
import { NOMES_DIMENSOES } from "@/lib/pulse/formato";
import { naJanela } from "@/lib/pulse/score";
import { type CheckIn, DIMENSOES, type IsoDate } from "@/lib/pulse/types";

const config = {
  media: { label: "Média", color: "var(--chart-1)" },
} satisfies ChartConfig;

type Tick = { x?: number | string; y?: number | string; textAnchor?: string; payload?: { value: string } };

/** Axis label that honours "\n", so the long Pressão label fits on narrow screens. */
function EixoEmLinhas({ x, y, textAnchor, payload }: Tick) {
  const linhas = payload?.value.split("\n") ?? [];
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor as "start" | "middle" | "end"}
      fontSize={12}
      fill="var(--muted-foreground)"
    >
      {linhas.map((linha, i) => (
        <tspan key={linha} x={x} dy={i === 0 ? `${-(linhas.length - 1) * 0.6}em` : "1.2em"}>
          {linha}
        </tspan>
      ))}
    </text>
  );
}

/** Average rating per dimension over the last 7 days. Pressão is inverted so further out is always better. */
export function DimensionsRadar({ checkIns, hoje }: { checkIns: CheckIn[]; hoje: IsoDate }) {
  const comEmocional = checkIns.filter((c) => c.emocional && naJanela(c, hoje));

  if (comEmocional.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">As dimensões aparecem depois do primeiro check-in.</p>;
  }

  const dados = DIMENSOES.map((dimensao) => {
    const soma = comEmocional.reduce((total, c) => total + nivelVisual(dimensao, c.emocional![dimensao]), 0);
    return {
      dimensao: dimensao === "pressao" ? "Pressão\n(menos é melhor)" : NOMES_DIMENSOES[dimensao],
      media: Math.round((soma / comEmocional.length) * 10) / 10,
    };
  });

  return (
    <ChartContainer config={config} className="mx-auto aspect-square max-h-64 w-full">
      <RadarChart data={dados} outerRadius="60%">
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <PolarGrid className="stroke-border" />
        <PolarAngleAxis dataKey="dimensao" tick={EixoEmLinhas} />
        <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
        <Radar dataKey="media" fill="var(--color-media)" fillOpacity={0.25} stroke="var(--color-media)" strokeWidth={2} />
      </RadarChart>
    </ChartContainer>
  );
}
