import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /*
   * The published site lives under the repository name on GitHub Pages
   * (kirisinclair.github.io/tiger-learns/), so every asset path has to carry
   * that prefix. Locally the dev server keeps serving from the root: the
   * prefix applies only to the production build, which is the only thing
   * Pages ever sees.
   */
  base: process.env.NODE_ENV === "production" ? "/tiger-learns/" : "/",
});
