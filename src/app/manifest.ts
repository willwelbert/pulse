import type { MetadataRoute } from "next";

// output: "export" only writes routes marked static.
export const dynamic = "force-static";

/**
 * Installs Pulse on the home screen, opening full screen like an app.
 * URLs are relative to this file, so they follow the basePath (/pulse/ on GitHub Pages).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pulse",
    short_name: "Pulse",
    description: "Seu ritmo, um batimento por dia.",
    lang: "pt-BR",
    start_url: "./",
    scope: "./",
    display: "standalone",
    // The Leque de notas is anchored on the thumb and doesn't fit sideways.
    orientation: "portrait",
    background_color: "#eaf0f1",
    theme_color: "#eaf0f1",
    icons: [
      { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
