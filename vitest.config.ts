import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      // Excluidos da medicao de testabilidade: codigo nao autoral (shadcn/ui
      // vendorizado), artefatos gerados (types.ts), bootstrap sem logica e a
      // propria infra de teste. Ver docs/tcc/medicoes/README.md.
      exclude: [
        "src/components/ui/**",
        "src/integrations/supabase/types.ts",
        "src/integrations/supabase/client.ts",
        "src/main.tsx",
        "src/App.tsx",
        "src/vite-env.d.ts",
        "src/test/**",
        "**/__tests__/**",
      ],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
