# Hubservi

Marketplace de servicos com fluxo client/provider, autenticacao Supabase e regras de acesso via RLS.

Service marketplace with client/provider flow, Supabase auth, and RLS-based data access control.

## PT-BR

### Visao geral
Hubservi e uma SPA em React + TypeScript para conectar clientes e prestadores de servicos.

Principais fluxos:
- Autenticacao por email/senha
- Navegacao publica de servicos ativos
- Solicitacao de servico (booking) por clientes
- Gestao de servicos e bookings por prestadores
- Dashboard com renderizacao por tipo de usuario

### Stack e ferramentas
- Linguagem: TypeScript
- Frontend: React 18, Vite 5, React Router DOM
- Estado de dados: TanStack React Query
- Formularios e validacao: React Hook Form, Zod
- UI: shadcn/ui, Radix UI, Tailwind CSS
- Backend: Supabase (Auth + PostgreSQL + RLS + triggers)
- Testes: Vitest, Testing Library
- Qualidade: ESLint

### Requisitos
- Node.js 20+
- npm 10+ (ou Bun)
- Projeto Supabase com credenciais validas

### Configuracao de ambiente
Crie um arquivo .env na raiz com:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### Como executar

```sh
npm install
npm run dev
```

Aplicacao local: http://localhost:8080

### Scripts
- npm run dev: ambiente local
- npm run build: build de producao
- npm run build:dev: build em modo desenvolvimento
- npm run preview: preview da build
- npm run lint: analise estatica
- npm run test: execucao unica de testes
- npm run test:watch: testes em watch

### Regras de negocio essenciais
- Tipos de usuario: client e provider
- Apenas provider cria/edita/remove seus servicos
- Apenas client cria booking
- Provider nao deve solicitar proprio servico
- Transicoes de booking no banco:
	- pending -> accepted ou rejected
	- accepted -> completed ou cancelled

### Segurança e dados
- RLS habilitado nas tabelas de dominio
- Trigger de criacao automatica de profile no signup
- Trigger de updated_at para tabelas principais
- View de agregacao service_stats para rating e total de reviews

### Documentacao detalhada
- [docs/README.md](docs/README.md)
- [docs/01-overview.md](docs/01-overview.md)
- [docs/02-architecture.md](docs/02-architecture.md)
- [docs/03-business-rules.md](docs/03-business-rules.md)
- [docs/04-data-and-security.md](docs/04-data-and-security.md)
- [docs/05-development-and-quality.md](docs/05-development-and-quality.md)

### Skills para desenvolvimento seguro
Skills criados para manter consistencia de regras e reduzir regressao:
- [.github/skills/pre-merge-review/SKILL.md](.github/skills/pre-merge-review/SKILL.md)
- [.github/skills/feature-guardrails/SKILL.md](.github/skills/feature-guardrails/SKILL.md)
- [.github/skills/test-safety-net/SKILL.md](.github/skills/test-safety-net/SKILL.md)
- [.github/skills/supabase-safe-migration/SKILL.md](.github/skills/supabase-safe-migration/SKILL.md)
- [.github/skills/docs-sync/SKILL.md](.github/skills/docs-sync/SKILL.md)

### Fluxo recomendado do time
1. Planejar alteracao com feature-guardrails
2. Implementar em pequenas etapas
3. Rodar lint, test e build
4. Revisar com pre-merge-review
5. Atualizar docs com docs-sync

## EN

### Overview
Hubservi is a React + TypeScript SPA that connects service clients and providers.

Core flows:
- Email/password authentication
- Public browsing of active services
- Service request (booking) by clients
- Service and booking management by providers
- Role-based dashboard rendering

### Stack and tools
- Language: TypeScript
- Frontend: React 18, Vite 5, React Router DOM
- Data state: TanStack React Query
- Forms and validation: React Hook Form, Zod
- UI: shadcn/ui, Radix UI, Tailwind CSS
- Backend: Supabase (Auth + PostgreSQL + RLS + triggers)
- Testing: Vitest, Testing Library
- Quality: ESLint

### Requirements
- Node.js 20+
- npm 10+ (or Bun)
- Supabase project with valid credentials

### Environment setup
Create .env at repository root:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### Run locally

```sh
npm install
npm run dev
```

Local app: http://localhost:8080

### Scripts
- npm run dev: local development
- npm run build: production build
- npm run build:dev: development-mode build
- npm run preview: preview build
- npm run lint: static analysis
- npm run test: run tests once
- npm run test:watch: watch mode

### Core business rules
- User roles: client and provider
- Only providers can create/update/delete their own services
- Only clients can create bookings
- Providers must not request their own service
- Booking status transitions enforced in DB:
	- pending -> accepted or rejected
	- accepted -> completed or cancelled

### Security and data
- RLS enabled in domain tables
- Auto profile creation trigger on signup
- updated_at trigger for main tables
- service_stats view for review count and rating aggregation

### Detailed documentation
- [docs/README.md](docs/README.md)
- [docs/01-overview.md](docs/01-overview.md)
- [docs/02-architecture.md](docs/02-architecture.md)
- [docs/03-business-rules.md](docs/03-business-rules.md)
- [docs/04-data-and-security.md](docs/04-data-and-security.md)
- [docs/05-development-and-quality.md](docs/05-development-and-quality.md)

### Skills for safe development
Created skills to preserve business consistency and reduce regressions:
- [.github/skills/pre-merge-review/SKILL.md](.github/skills/pre-merge-review/SKILL.md)
- [.github/skills/feature-guardrails/SKILL.md](.github/skills/feature-guardrails/SKILL.md)
- [.github/skills/test-safety-net/SKILL.md](.github/skills/test-safety-net/SKILL.md)
- [.github/skills/supabase-safe-migration/SKILL.md](.github/skills/supabase-safe-migration/SKILL.md)
- [.github/skills/docs-sync/SKILL.md](.github/skills/docs-sync/SKILL.md)

### Recommended team flow
1. Plan changes with feature-guardrails
2. Implement in small slices
3. Run lint, test, and build
4. Review with pre-merge-review
5. Sync docs with docs-sync
