import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      primary: "#EAB308",

      secondary: "#064E3B",

      accent: "#007200",

      neutral: "#0d1311",

      "base-100": "#1e2a24",

      info: "#00caff",

      success: "#064E3B",

      warning: "#f94e00",

      error: "#e00037",
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#064E3B", // Change step-primary color
          "secondary": "#EAB308",
          "accent": "#757575",
          // Other colors...
        },
      },
    ],
  },
  plugins: [daisyui],
};
