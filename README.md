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
- Node.js 20+ (versao fixada em `.nvmrc`)
- npm 11+ (`package-lock.json` e o unico lockfile valido; use `npm ci`)
- Projeto Supabase com credenciais validas
- Docker Desktop **em execucao**, apenas para os testes de integracao
  (a CLI do Supabase nao precisa ser instalada: e baixada por `npx supabase@2.109.1`)

### Configuracao de ambiente
Copie o template e preencha com as credenciais do seu projeto Supabase:

```sh
cp .env.example .env
```

Os testes de integracao **nao** usam esse arquivo: eles falam com o stack local
pelas chaves fixas da CLI, resolvidas em `tests/integration/helpers/env.ts`.

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

### Testes de integracao (stack Supabase local)

Rodam contra o PostgREST real, com clientes autenticados por papel — nao contra
mocks. Exigem Docker em execucao e ficam **fora do CI** por decisao explicita
(lentos e instaveis em runner efemero).

```sh
npm run db:start          # sobe o stack local (a 1a vez baixa as imagens)
npm run db:reset          # aplica migrations + seed sobre um banco limpo
npm run test:integration  # suite de RLS, triggers e integridade (9 arquivos)
npm run db:stop
```

Passo a passo completo, do zero:
[docs/tcc/apendice-b-reproducao.md](docs/tcc/apendice-b-reproducao.md#passo-a-passo-na-sua-máquina)

Atencao: `npm run test:integration` **apaga os dados de dominio** do stack local
(`reviews`, `bookings`, `services`) a cada arquivo de teste. Usuarios e
categorias sao preservados.

### Teste de carga

```sh
npm run load:seed         # semeia N servicos (SEED_N, padrao 50)
npm run load:smoke        # 5 conexoes / 5 s
npm run load:run          # 30 conexoes / 20 s
```

Saidas em `docs/tcc/medicoes/evidencias/AAAA-MM-DD/`.

### Medicoes de qualidade (TCC)

O repositorio e objeto de um TCC de avaliacao arquitetural. As medicoes, suas
evidencias e o protocolo de reproducao estao em
[docs/tcc/medicoes/](docs/tcc/medicoes/):

```sh
npm run repro             # lista as trilhas de reproducao
npm run repro:offline     # ~1-2 min, sem Docker: cobertura, lint, ciclos, duplicacao
npm run repro:integracao  # ~4-6 min, com Docker: RLS e triggers
```

Cada trilha executa em `git worktree` fixado no commit da coleta, para que os
numeros saiam identicos aos do artigo. Detalhes, tempos e o que **nao** e
reproduzivel: [docs/tcc/apendice-b-reproducao.md](docs/tcc/apendice-b-reproducao.md).

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
- Migracao corretiva para sincronizar auth.users -> profiles com backfill
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
- Node.js 20+ (pinned in `.nvmrc`)
- npm 11+ (`package-lock.json` is the only valid lockfile; use `npm ci`)
- Supabase project with valid credentials
- Docker Desktop **running**, for integration tests only
  (the Supabase CLI needs no install: it is fetched via `npx supabase@2.109.1`)

### Environment setup
Copy the template and fill in your Supabase project credentials:

```sh
cp .env.example .env
```

Integration tests do **not** read this file: they talk to the local stack using
the CLI's fixed demo keys, resolved in `tests/integration/helpers/env.ts`.

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

### Integration tests (local Supabase stack)

These run against the real PostgREST with role-authenticated clients, not
mocks. They require Docker and are deliberately **excluded from CI** (slow and
flaky on ephemeral runners).

```sh
npm run db:start          # start the local stack (first run pulls images)
npm run db:reset          # apply migrations + seed on a clean database
npm run test:integration  # RLS, trigger and integrity suite (9 files)
npm run db:stop
```

Full step-by-step, from scratch:
[docs/tcc/apendice-b-reproducao.md](docs/tcc/apendice-b-reproducao.md#passo-a-passo-na-sua-máquina)

Note: `npm run test:integration` **wipes domain data** from the local stack
(`reviews`, `bookings`, `services`) before each test file. Users and categories
are preserved.

### Load test

```sh
npm run load:seed         # seed N services (SEED_N, default 50)
npm run load:smoke        # 5 connections / 5 s
npm run load:run          # 30 connections / 20 s
```

Output goes to `docs/tcc/medicoes/evidencias/YYYY-MM-DD/`.

### Quality measurements (thesis)

This repository is the case study of an architectural evaluation thesis.
Measurements, evidence and the reproduction protocol live in
[docs/tcc/medicoes/](docs/tcc/medicoes/):

```sh
npm run repro             # list reproduction tracks
npm run repro:offline     # ~1-2 min, no Docker: coverage, lint, cycles, duplication
npm run repro:integracao  # ~4-6 min, with Docker: RLS and triggers
```

Each track runs inside a `git worktree` pinned to the commit where the data was
collected, so the numbers match the article exactly. Details, timings and what
is **not** reproducible: [docs/tcc/apendice-b-reproducao.md](docs/tcc/apendice-b-reproducao.md).

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
- Corrective migration to sync auth.users -> profiles with backfill
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
