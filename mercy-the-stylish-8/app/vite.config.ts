import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: ".",
  publicDir: "public",
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
});
