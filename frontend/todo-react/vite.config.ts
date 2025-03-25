// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    svgr()
  ],
  base: "/",
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      host: "localhost",
      port: 5173,
    },
  
  },
  build: {
    outDir: "build",
    emptyOutDir: true,
    cssCodeSplit: true,
  },
});
