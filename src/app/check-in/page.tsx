"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckInStepper } from "@/components/CheckInStepper";
import { Skeleton } from "@/components/ui/skeleton";
import { usePulseHoje } from "@/hooks/usePulse";

function CheckIn() {
  const { data } = usePulseHoje();
  const tipoInicial = useSearchParams().get("tipo") === "descanso" ? "descanso" : null;

  if (!data) return <Skeleton className="h-96 w-full rounded-2xl" />;
  // Keyed by day so the simulated clock moving forward starts a fresh check-in.
  return <CheckInStepper key={data.hoje} pulse={data} tipoInicial={tipoInicial} />;
}

export default function CheckInPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <CheckIn />
    </Suspense>
  );
}
