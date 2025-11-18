"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export const ThemeProvider = ({
  children,
  defaultTheme = "light",
}: {
  children: ReactNode;
  defaultTheme?: Theme;
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // 🔹 1) Carregar tema salvo no localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;

    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    } else {
      // salva o defaultTheme no localStorage se nenhum existir
      localStorage.setItem("theme", defaultTheme);
      setTheme(defaultTheme);
    }
  }, [defaultTheme]);

  // 🔹 2) Aplicar a classe `dark` ou `light` no HTML
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  // 🔹 3) Alternar o tema e salvar no localStorage
  const toggleTheme = () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
