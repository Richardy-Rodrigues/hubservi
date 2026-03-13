# 05 - Development and Quality

## PT-BR

### Pre-requisitos
- Node.js 20+
- npm 10+ (ou Bun, conforme preferencia)
- Projeto Supabase configurado

### Variaveis de ambiente
Defina no .env:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

### Scripts principais
- npm run dev: sobe servidor local Vite
- npm run build: build de producao
- npm run build:dev: build em modo desenvolvimento
- npm run preview: preview da build
- npm run lint: analise estatica
- npm run test: executa testes uma vez
- npm run test:watch: modo watch para testes

### Fluxo recomendado de desenvolvimento
1. Sincronizar branch
2. Implementar mudanca em pequeno escopo
3. Rodar lint e testes
4. Revisar impacto em regras de negocio e RLS
5. Atualizar documentacao afetada

### Checklist minimo antes de merge
- Build local sem erros
- Lint sem erros criticos
- Testes relevantes passando
- Sem quebra de fluxo em auth, services, booking e dashboard
- Sem afrouxar regras de autorizacao

### Lacunas atuais
- Cobertura de testes ainda inicial
- Necessidade de ampliar testes para regras de negocio e policies
- Potencial evolucao para gates mais estritos no CI

## EN

### Prerequisites
- Node.js 20+
- npm 10+ (or Bun)
- Configured Supabase project

### Environment variables
Define in .env:
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

### Main scripts
- npm run dev: starts local Vite server
- npm run build: production build
- npm run build:dev: development-mode build
- npm run preview: preview built app
- npm run lint: static analysis
- npm run test: run tests once
- npm run test:watch: test watch mode

### Recommended development flow
1. Sync branch
2. Implement small-scoped change
3. Run lint and tests
4. Review business rule and RLS impact
5. Update affected documentation

### Minimum pre-merge checklist
- Local build passes
- Lint has no critical errors
- Relevant tests pass
- No flow regressions in auth, services, booking, and dashboard
- No authorization weakening

### Current gaps
- Test coverage is still at an early stage
- Need broader tests for business rules and policies
- Future opportunity to enforce stricter CI gates
