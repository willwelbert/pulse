# Pulse

Prova de conceito de **outro caminho** para o Pulse do app.added.today:

- **shadcn** no lugar do design system interno, com o tema mapeado para os tokens da Added (brand-blue, surface, content, Aileron e PT Serif);
- **check-in passo a passo** e mobile-first, com o estado emocional num **leque de notas** ancorado no polegar (uma fatia por dimensão; mais para fora é sempre melhor, então a Pressão aparece invertida);
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

## Check-in rápido

Em qualquer tela (menos no check-in completo), o botão com o ícone de pulso, no canto inferior direito, abre o check-in rápido. **Segurar por ~1,2s** simula checar a pulsação: um anel enche em volta do ícone, o botão bate como um coração e vibra em dois "tum-tum". Soltar antes pede para continuar segurando. No teclado, Enter abre direto.

1. O **leque de notas** abre com o centro sobre o próprio botão. O centro mostra "N/5" e vira **✓** quando as 5 notas estão preenchidas.
2. O ✓ abre uma **Drawer** com o resto do dia (Dia normal ou Dia de descanso, Conteúdos, Reuniões e Tempo trabalhado). Esse é o preço do check-in.
3. Depois de salvar, a Drawer mostra o Pulse Diário, a linha e as novas conquistas.

**Vibração:** no Android usa `navigator.vibrate` (`src/lib/haptics.ts`), com os dois batimentos enquanto o botão é segurado. No iPhone nenhum navegador implementa essa API. Lá, o `HapticSwitch` (padrão do [tijnjh/ios-haptics](https://github.com/tijnjh/ios-haptics)) cobre as áreas tocáveis com um label transparente que repassa o toque a um `<input switch>` oculto, e o iOS 18+ toca o háptico do sistema. Isso só acontece num **toque real**: os toques no leque, no ✓ e no "Salvar check-in", e o momento de soltar depois de segurar. Os batimentos por timer não vibram no iPhone.

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

O painel também tem **Avançar 1 dia**, para ver a semana e o ritmo mudarem, **Data real** e **Instalar no celular** (veja abaixo).

## App no celular (PWA)

O Pulse pode ser instalado na tela inicial do celular e abre em tela cheia, sem a barra do navegador.

- **Android:** no Chrome, menu ⋮ → **Instalar app**. Quando o navegador permite, o Modo demonstração mostra o botão **Instalar o Pulse**.
- **iPhone:** no Safari, **Compartilhar** → **Adicionar à Tela de Início**. No iOS 26, "Abrir como app web" já vem ligado.

Instalar exige HTTPS, então o teste de verdade é no GitHub Pages. Pelo `pnpm dev:host` (HTTP na rede local), o iPhone já abre em tela cheia, mas o Android não oferece instalar. Não há service worker: o app instalado precisa de internet para abrir.

No iPhone, o app instalado tem armazenamento separado do Safari e começa com o histórico vazio. Os cenários do Modo demonstração resolvem isso.

Os ícones usam o símbolo da Added Today (`public/added-today-symbol-blue.svg`), em branco sobre o azul do botão Pulse. A referência é `src/app/icon.svg`. Os PNGs de `public/icons/` e o `src/app/apple-icon.png` são esse desenho rasterizado; as versões maskable e Apple não têm cantos arredondados.

## Estrutura

```
src/lib/pulse/         regras de domínio puras (score, ritmo, conquistas, acolhimento, linha, tempo)
src/lib/clock.ts       "hoje" injetável, usado pelo Modo demonstração
src/lib/instalacao.ts  instalação na tela inicial, oferecida no Modo demonstração
src/utils/adapters/    schemas zod e envelope da API
src/utils/mock/        API falsa, store em localStorage e cenários
src/hooks/             TanStack Query (today, dashboard, salvar check-in)
src/components/        telas e peças (CheckInStepper, PulseLine, WeekStrip…)
src/components/ui/     shadcn
```
