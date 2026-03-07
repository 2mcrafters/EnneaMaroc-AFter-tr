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
          light: "#fecaca", // red-200 equivalent for light tints
          DEFAULT: "#e13734", // primary red
          dark: "#0a83ca", // primary blue
        },
        brandRed: "#e13734",
        brandBlue: "#0a83ca",
        // Backwards-compatibility: keep `pistachio` token name used across the codebase
        pistachio: {
          light: "#fecaca", // light red for backgrounds
          DEFAULT: "#e13734", // main red color
          dark: "#0a83ca", // main blue color for dark elements
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
