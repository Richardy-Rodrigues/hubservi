# 01 - Product Overview

## PT-BR

### Objetivo do produto
Hubservi e uma plataforma de marketplace de servicos onde clientes podem buscar e solicitar servicos e prestadores podem publicar e gerenciar sua oferta.

### Linguagem e stack principal
- Linguagem: TypeScript
- Frontend: React 18 + Vite 5
- Roteamento: React Router DOM 6
- Estado server-side: TanStack React Query
- Formularios e validacao: React Hook Form + Zod
- UI: shadcn/ui + Radix UI + Tailwind CSS
- Backend: Supabase (Auth + Postgres + RLS)

### Funcionalidades principais
- Cadastro e login com perfil client ou provider
- Listagem publica de servicos ativos
- Detalhe de servico com acao de solicitacao
- Dashboard protegido com experiencia por papel
- Gestao de servicos para provider
- Gestao de bookings para client e provider

### Estrutura principal de diretorios
- src/pages: paginas de navegacao
- src/components: componentes de UI e negocio
- src/contexts: estado global de autenticacao
- src/integrations/supabase: cliente e tipos da base
- supabase/migrations: schema, policies e triggers

## EN

### Product goal
Hubservi is a service marketplace where clients can search and request services, and providers can publish and manage their offerings.

### Main language and stack
- Language: TypeScript
- Frontend: React 18 + Vite 5
- Routing: React Router DOM 6
- Server state: TanStack React Query
- Forms and validation: React Hook Form + Zod
- UI: shadcn/ui + Radix UI + Tailwind CSS
- Backend: Supabase (Auth + Postgres + RLS)

### Core features
- Sign up and sign in with client or provider profile
- Public listing of active services
- Service detail with request action
- Protected dashboard with role-based experience
- Service management for providers
- Booking management for clients and providers

### Main directory structure
- src/pages: route pages
- src/components: UI and business components
- src/contexts: global auth state
- src/integrations/supabase: database client and types
- supabase/migrations: schema, policies, and triggers
