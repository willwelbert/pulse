"use client";

import { Activity, Megaphone } from "lucide-react";
import Link from "next/link";
import { AchievementList } from "@/components/AchievementList";
import { CareBanner } from "@/components/CareBanner";
import { DimensionsRadar } from "@/components/DimensionsRadar";
import { PulseLegend, PulseLine } from "@/components/PulseLine";
import { ScoreRing } from "@/components/ScoreRing";
import { WeekStrip } from "@/components/WeekStrip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePulseDashboard } from "@/hooks/usePulse";

export default function DashboardPage() {
  const { painel } = usePulseDashboard();

  if (!painel) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const checkInDeHoje = painel.checkIns.find((c) => c.date === painel.hoje);

  return (
    <div className="space-y-4 pb-28">
      <header className="space-y-4">
        <div className="flex items-center gap-3 pr-12">
          <span className="grid size-10 place-items-center rounded-xl bg-card text-primary">
            <Activity className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="font-serif text-3xl leading-none">Pulse</h1>
            <p className="text-sm text-muted-foreground">
              Seu ritmo, um batimento por dia.
            </p>
          </div>
        </div>
      </header>

      {painel.acolhimento && <CareBanner />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 font-serif text-xl">
            Sua linha de pulso
            {painel.semanasSeguidas > 0 && (
              <Badge variant="secondary">
                {painel.semanasSeguidas}{" "}
                {painel.semanasSeguidas === 1 ? "semana" : "semanas"} no ritmo
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Últimos 14 dias. A linha ganha força a cada semana no ritmo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <PulseLine
            batimentos={painel.linha}
            semanasSeguidas={painel.semanasSeguidas}
          />
          <PulseLegend />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <WeekStrip ritmo={painel.ritmo} hoje={painel.hoje} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Como você está</CardTitle>
          <CardDescription>Últimos 7 dias.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScoreRing score={painel.score} />
          <DimensionsRadar checkIns={painel.checkIns} hoje={painel.hoje} />
          <p className="flex items-center gap-2 border-t pt-3 text-sm text-muted-foreground">
            <Megaphone className="size-4" aria-hidden />
            {painel.campanhasAtivas} campanhas ativas · vindo do Radar
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Conquistas</CardTitle>
          <CardDescription>
            Elas recompensam registrar, nunca a nota.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AchievementList desbloqueadas={painel.conquistas} />
        </CardContent>
      </Card>
    </div>
  );
}
