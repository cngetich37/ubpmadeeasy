import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "./ThemeContext";

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="ml-2 p-2 rounded-full border-2 border-transparent hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition bg-white dark:bg-gray-900"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <FaMoon className="text-emerald-900 text-xl dark:text-yellow-400" />
      ) : (
        <FaSun className="text-yellow-400 text-xl dark:text-emerald-900" />
      )}
    </button>
  );
};

export default ThemeSwitcher; 