import type { Metadata } from "next";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Reserva de Móviles",
  description: "Demo — reserva de vehículos promocionales",
};

// Script que corre ANTES del primer render: lee la preferencia guardada
// (o la del sistema operativo si es la primera visita) y pone la clase
// "dark" en <html> de una vez, para que no haya un parpadeo de blanco
// antes de que React se monte.
const noFlashScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var wantsDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (wantsDark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
