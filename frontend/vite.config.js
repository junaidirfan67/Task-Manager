import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const pagesBase = repositoryName?.endsWith(".github.io") ? "/" : `/${repositoryName}/`;
const base = process.env.VITE_BASE_PATH || (repositoryName ? pagesBase : "/");

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173
  }
});
