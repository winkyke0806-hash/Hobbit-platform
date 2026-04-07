import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/database"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./__tests__/setup.js",
    globals: true,
  },
});
