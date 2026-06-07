import { defineConfig } from "@tanstack/start-config";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  tsr: {
    appDirectory: "./src",
  },
  vite: {
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
    ],
  },
  server: {
    preset: "vercel",
  },
});
