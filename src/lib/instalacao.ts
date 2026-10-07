/**
 * Installing Pulse on the home screen, offered in the Modo demonstração.
 * Chromium browsers fire beforeinstallprompt once the app is installable and
 * let the page open their install dialog later. Safari never does: on the
 * iPhone it's done by hand from the Share menu.
 */

/** `disponivel`: the browser's install dialog can open. `manual`: only by hand. */
export type Instalacao = "instalado" | "disponivel" | "manual";

// BeforeInstallPromptEvent is Chromium-only, so it's not in the DOM types.
type PedidoDeInstalacao = Event & { prompt: () => Promise<unknown> };

const ouvintes = new Set<() => void>();
let pedido: PedidoDeInstalacao | null = null;
let instalou = false;

function avisar() {
  ouvintes.forEach((ouvir) => ouvir());
}

// The event can fire before React mounts, so it's caught as soon as this loads.
// No preventDefault: the browser keeps offering the install on its own as well.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (evento) => {
    pedido = evento as PedidoDeInstalacao;
    avisar();
  });
  window.addEventListener("appinstalled", () => {
    pedido = null;
    instalou = true;
    avisar();
  });
}

export function instalacao(): Instalacao {
  if (instalou || window.matchMedia("(display-mode: standalone)").matches) return "instalado";
  return pedido ? "disponivel" : "manual";
}

/** Opens the browser's install dialog. Each event opens it once; after that it's by hand again. */
export async function instalar() {
  const atual = pedido;
  pedido = null;
  // prompt() needs the tap that called this, so it runs before anything else.
  const escolha = atual?.prompt();
  avisar();
  try {
    await escolha;
  } catch {
    // Already used or blocked: the steps by hand are showing again.
  }
}

export function assinarInstalacao(ouvir: () => void): () => void {
  ouvintes.add(ouvir);
  return () => ouvintes.delete(ouvir);
}
