import { useEffect, useState } from "react";

const THEMES = ["default", "dark", "blue", "green", "pink"];

export const useTheme = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "default");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme, themesAvailable: THEMES };
};
