"use client";

import { useThemeContext } from "../contexts/ThemeContext";

// import { useThemeContext } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
    >
      {theme === "light" ? "🌙 Modo Escuro" : "☀️ Modo Claro"}
    </button>
  );
}
