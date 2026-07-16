// Configuracao de ESLint SOMENTE para medicao de manutenibilidade (Semana 7 do
// TCC). NAO e o lint do projeto (eslint.config.js) — nao altera o gate de CI. Serve
// para produzir o "segundo ponto de dado" do §5.2.4: alem das violacoes de estilo
// da config atual, quantos code smells e pontos de complexidade uma configuracao
// recomendada acusaria. Roda: npx eslint --config eslint.measure.config.js src
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "coverage",
      "src/components/ui/**",
      "src/integrations/supabase/types.ts",
      "**/__tests__/**",
      "src/test/**",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, sonarjs.configs.recommended],
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { ecmaVersion: 2020 },
    rules: {
      // Complexidade ciclomatica como metrica adicional (limiar SonarQube-like).
      complexity: ["warn", 15],
    },
  },
);
