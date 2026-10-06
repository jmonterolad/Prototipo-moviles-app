"use client";

// src/components/ThemeToggle.tsx
// Botón flotante para cambiar entre modo día y modo noche. El estado se
// guarda en localStorage; el script inline en layout.tsx ya deja puesta
// la clase "dark" en <html> antes del primer render, así que acá solo
// hace falta leerla y ofrecer el botón para cambiarla.

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage puede fallar (modo privado, etc.) — no es crítico
    }
  }

  // Evita parpadear con el ícono equivocado mientras se lee el estado real
  if (isDark === null) {
    return <div className="fixed top-3 right-3 z-50 h-10 w-10" aria-hidden />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo día" : "Cambiar a modo noche"}
      title={isDark ? "Modo día" : "Modo noche"}
      className="fixed top-3 right-3 z-50 h-10 w-10 rounded-full border
        border-neutral-300 bg-white text-neutral-600 shadow-sm
        hover:bg-neutral-50 transition-colors
        dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700
        flex items-center justify-center text-lg"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
