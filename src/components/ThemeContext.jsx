import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export const useTheme = () => useContext(ThemeContext);

function getSystemTheme() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export const ThemeProvider = ({ children }) => {
  // theme: 'light' | 'dark'
  // userPreference: null | 'light' | 'dark'
  const [userPreference, setUserPreference] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || null;
    }
    return null;
  });
  const [theme, setTheme] = useState(() => userPreference || getSystemTheme());

  // Listen for system theme changes
  useEffect(() => {
    if (!userPreference) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        setTheme(media.matches ? "dark" : "light");
      };
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
  }, [userPreference]);

  // Update theme when userPreference or system changes
  useEffect(() => {
    if (userPreference) {
      setTheme(userPreference);
    } else {
      setTheme(getSystemTheme());
    }
  }, [userPreference]);

  useEffect(() => {
    if (userPreference) {
      localStorage.setItem("theme", userPreference);
    } else {
      localStorage.removeItem("theme");
    }
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, userPreference]);

  const toggleTheme = () => {
    setUserPreference((prev) => {
      if (!prev) {
        // If no user preference, set to opposite of system
        return getSystemTheme() === "dark" ? "light" : "dark";
      }
      // If user preference exists, toggle
      return prev === "light" ? "dark" : "light";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, userPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}; 