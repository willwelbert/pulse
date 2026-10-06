"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { NOMES_DIMENSOES } from "@/lib/pulse/formato";
import { naJanela } from "@/lib/pulse/score";
import { type CheckIn, DIMENSOES, type IsoDate } from "@/lib/pulse/types";

const config = {
  media: { label: "Média", color: "var(--chart-1)" },
} satisfies ChartConfig;

/** Average rating per dimension over the last 7 days. Pressão is shown as answered. */
export function DimensionsRadar({ checkIns, hoje }: { checkIns: CheckIn[]; hoje: IsoDate }) {
  const comEmocional = checkIns.filter((c) => c.emocional && naJanela(c, hoje));

  if (comEmocional.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">As dimensões aparecem depois do primeiro check-in.</p>;
  }

  const dados = DIMENSOES.map((dimensao) => ({
    dimensao: NOMES_DIMENSOES[dimensao],
    media:
      Math.round(
        (comEmocional.reduce((soma, c) => soma + (c.emocional?.[dimensao] ?? 0), 0) / comEmocional.length) * 10,
      ) / 10,
  }));

  return (
    <ChartContainer config={config} className="mx-auto aspect-square max-h-64 w-full">
      <RadarChart data={dados} outerRadius="72%">
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <PolarGrid className="stroke-border" />
        <PolarAngleAxis dataKey="dimensao" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
        <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
        <Radar dataKey="media" fill="var(--color-media)" fillOpacity={0.25} stroke="var(--color-media)" strokeWidth={2} />
      </RadarChart>
    </ChartContainer>
  );
}
