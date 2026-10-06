# Pulse

Prova de conceito de **outro caminho** para o Pulse do app.added.today:

- **shadcn** no lugar do design system interno, com o tema mapeado para os tokens da Added (brand-blue, surface, content, Aileron e PT Serif);
- **check-in passo a passo**, uma pergunta por tela e mobile-first;
- **Campanhas ativas** vindo do Radar em vez de ser digitada no check-in;
- **gamificação por constância**: Ritmo semanal, Dia de descanso, Conquistas, Linha de pulso e Modo acolhimento.

O vocabulário do domínio está em [`CONTEXT.md`](./CONTEXT.md), e a decisão principal em [`docs/adr/0001`](./docs/adr/0001-gamificacao-recompensa-registro-nao-nota.md).

## Stack

Next.js 16 (App Router) · Tailwind CSS v4 · shadcn (radix-nova) · TanStack Query · zod · vitest + Testing Library · oxlint · pnpm.

Os dados são mockados atrás de adapters com zod que imitam o envelope `{ success, data | errors }` de `api.added.today/pulse/*` (`src/utils/mock/api.ts`). Ficam no `localStorage`, então trocar pela API real é trocar a implementação dessas três funções.

## Rodando

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test:run     # domínio, adapters e fluxo do check-in
pnpm lint
pnpm build
```

## Modo demonstração

O botão com o ícone de frasco, no canto superior direito, abre o Modo demonstração. Ele simula a passagem dos dias e carrega históricos prontos, para mostrar cada regra sem esperar os dias passarem:

| Cenário | O que mostra |
| --- | --- |
| Primeiro acesso | Linha vazia. O primeiro check-in desbloqueia **Primeiro pulso**. |
| Esqueceu ontem | O check-in pergunta se o registro é de **hoje ou de ontem**. |
| Semana no ritmo | Sexta-feira com 4 de 5 dias. O check-in de hoje desbloqueia **Semana no ritmo**. |
| Pressão alta 3 dias | Liga o **Modo acolhimento** e mostra batimentos vermelhos e irregulares na linha. |
| Volta depois de sumir | 10 dias sem registro. O próximo check-in desbloqueia **De volta**. |
| 4 semanas no ritmo | O check-in de hoje completa **4 semanas no ritmo**. |

O painel também tem **Avançar 1 dia**, para ver a semana e o ritmo mudarem, e **Data real**.

## Estrutura

```
src/lib/pulse/         regras de domínio puras (score, ritmo, conquistas, acolhimento, linha, tempo)
src/lib/clock.ts       "hoje" injetável, usado pelo Modo demonstração
src/utils/adapters/    schemas zod e envelope da API
src/utils/mock/        API falsa, store em localStorage e cenários
src/hooks/             TanStack Query (today, dashboard, salvar check-in)
src/components/        telas e peças (CheckInStepper, PulseLine, WeekStrip…)
src/components/ui/     shadcn
```
