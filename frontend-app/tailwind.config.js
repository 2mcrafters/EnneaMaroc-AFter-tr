/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./vitrine/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#e8e0f5", // light purple tints
          DEFAULT: "#ff7d2d", // primary orange
          dark: "#64508d", // primary purple
        },
        brandRed: "#ff7d2d",
        brandBlue: "#64508d",
        // Backwards-compatibility: keep `pistachio` token name used across the codebase
        pistachio: {
          light: "#e8e0f5", // light purple for backgrounds
          DEFAULT: "#ff7d2d", // main orange color
          dark: "#64508d", // main purple color for dark elements
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Montserrat", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      animation: {
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
