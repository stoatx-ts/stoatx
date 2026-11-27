import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    // The app is only run locally, so one bundle is fine; a hosted client would split it per route.
    chunkSizeWarningLimit: 1000,
  },
});
