import { useEffect, useState, type ReactNode } from "react";

import { ThemeContext, type Theme } from "./themeContext";

const themeStorageKey = "travel-blog-theme";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Loads the theme previously selected by the user
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(themeStorageKey);

    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
