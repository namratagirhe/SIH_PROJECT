import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("mastitis_theme") || "light");

  useEffect(() => {
    localStorage.setItem("mastitis_theme", theme);
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      document.body.setAttribute("data-theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      document.body.setAttribute("data-theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
