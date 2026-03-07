import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [react()],
    // Base path: use VITE_BASE_PATH (allows '/' for subdomain root like https://course.alingua.ma/)
    base: env.VITE_BASE_PATH || "/",
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
