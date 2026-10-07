"use client";

import { Download, EllipsisVertical, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstalacao } from "@/hooks/useInstalacao";
import { instalar } from "@/lib/instalacao";

/** Modo demonstração: put Pulse on the phone's home screen, where it opens full screen. */
export function InstallSection() {
  const instalacao = useInstalacao();
  if (!instalacao) return null;

  return (
    <section className="space-y-2">
      <h3 className="eyebrow">Instalar no celular</h3>
      {instalacao === "instalado" && (
        <p className="text-sm text-muted-foreground">O Pulse está instalado neste aparelho e abre em tela cheia.</p>
      )}
      {instalacao === "disponivel" && (
        <Button variant="outline" className="h-12 w-full" onClick={() => instalar()}>
          <Download aria-hidden /> Instalar o Pulse
        </Button>
      )}
      {instalacao === "manual" && (
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>
            <span className="font-semibold text-foreground">iPhone:</span> no Safari, toque em{" "}
            <Share className="inline size-4 align-text-bottom" aria-hidden /> Compartilhar e em Adicionar à Tela de
            Início.
          </li>
          <li>
            <span className="font-semibold text-foreground">Android:</span> no Chrome, abra o menu{" "}
            <EllipsisVertical className="inline size-4 align-text-bottom" aria-hidden /> e toque em Instalar app.
          </li>
        </ul>
      )}
    </section>
  );
}
