// postcss.config.js (ESM)
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [
    tailwindcss(), // Tailwind v4 adapter
    autoprefixer(), // <-- now imported
  ],
};
