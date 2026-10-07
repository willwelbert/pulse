import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { PT_Serif } from "next/font/google";
import { DemoPanel } from "@/components/DemoPanel";
import { QuickCheckIn } from "@/components/quick-check-in/QuickCheckIn";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css";

const aileron = localFont({
  variable: "--font-aileron",
  src: [
    { path: "./fonts/Aileron-UltraLight.otf", weight: "200" },
    { path: "./fonts/Aileron-Light.otf", weight: "300" },
    { path: "./fonts/Aileron-Regular.otf", weight: "400" },
    { path: "./fonts/Aileron-SemiBold.otf", weight: "600" },
    { path: "./fonts/Aileron-Bold.otf", weight: "700" },
  ],
});

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Pulse",
  description: "Prova de conceito: check-in diário do Pulse com shadcn e gamificação por constância.",
  // Installed on the iPhone: dark status bar text, like the rest of the light page.
  appleWebApp: { title: "Pulse", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#eaf0f1",
  // Installed, the app fills the screen, so the env(safe-area-inset-*) paddings take effect.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${aileron.variable} ${ptSerif.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>
          <div className="mx-auto w-full max-w-2xl px-4 py-4 sm:py-8">{children}</div>
          <DemoPanel />
          <QuickCheckIn />
          <Toaster theme="light" position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
