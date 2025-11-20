"use client";

import ThemeSwitchButton from "./ThemeSwitchButton";
import { useThemeContext } from "../contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <ThemeSwitchButton
      checked={theme === "dark"}
      onChange={toggleTheme}
    />
  );
}
