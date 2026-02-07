import { resolve } from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { tanstackRouter } from "@tanstack/router-plugin/vite"

export default defineConfig({
  plugins: [tanstackRouter(), react()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
})
