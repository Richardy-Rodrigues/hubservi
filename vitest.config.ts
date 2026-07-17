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
      // Limiares (Secao 5.2.3). O global e um piso anti-regressao — deliberadamente
      // modesto porque paginas/dashboards extensos (ClientDashboard, ProviderDashboard,
      // Services, Auth) seguem sem teste nesta fase. O rigor esta nos MODULOS CRITICOS,
      // enumerados explicitamente com piso >=75%: definir o que e critico e uma decisao
      // metodologica, preferivel a um numero global inatingivel. use-toast nao entra:
      // seu reducer (a logica) esta coberto; o restante e plumbing vendorizado do shadcn.
      thresholds: {
        statements: 30,
        lines: 30,
        functions: 45,
        branches: 70,
        "src/lib/schemas/**": { lines: 100, functions: 100 },
        "src/integrations/supabase/views.ts": { lines: 90 },
        "src/contexts/AuthContext.tsx": { lines: 78 },
        "src/components/ReviewForm.tsx": { lines: 85 },
        "src/components/BookingDialog.tsx": { lines: 90 },
        "src/components/ProtectedRoute.tsx": { lines: 90 },
        "src/components/dashboard/ServiceForm.tsx": { lines: 80 },
        "src/components/dashboard/ProfileForm.tsx": { lines: 85 },
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
