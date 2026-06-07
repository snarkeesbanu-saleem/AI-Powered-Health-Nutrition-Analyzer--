// app.config.ts
import { defineConfig } from "@tanstack/start-config";
import tsconfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  tsr: {
    appDirectory: "./src"
  },
  vite: {
    plugins: [
      tsconfigPaths()
    ]
  },
  server: {
    preset: "vercel"
  }
});
export {
  app_config_default as default
};
