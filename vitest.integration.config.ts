import { defineConfig } from "vitest/config";
import path from "path";

// Config separada da suite unitaria (vitest.config.ts). Os testes de integracao
// rodam contra o stack Supabase local (PostgREST + GoTrue + Postgres reais), em
// ambiente Node — sem jsdom, sem paralelismo entre arquivos (compartilham o mesmo
// banco). Ver docs/tcc/medicoes/README.md e o plano da Semana 2.
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["./tests/integration/setup.ts"],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
