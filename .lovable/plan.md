

## ServiHub — Fase 1: Fundação + Catálogo Público

### 1. Backend (Lovable Cloud / Supabase)

**Tabelas com RLS:**
- **profiles** — id, email, full_name, phone, avatar_url, user_type (client/provider), created_at, updated_at
- **categories** — id, name, description, icon
- **services** — id, provider_id, category_id, title, description, price_min, price_max, price_type, location, is_active, created_at, updated_at
- **bookings** — id, service_id, client_id, provider_id, status (pending/accepted/completed/rejected/cancelled), message, scheduled_date, created_at, updated_at
- **reviews** — id, service_id, client_id, provider_id, rating (1-5), comment, created_at — com constraint UNIQUE(service_id, client_id)
- **service_stats** — VIEW calculando review_count e average_rating por serviço

**Trigger:** Criação automática de profile no signup

**RLS:** Profiles (leitura/edição própria), Services (provider edita, público vê ativos), demais tabelas preparadas para fases seguintes

**Dados iniciais:** Categorias pré-populadas (Limpeza, Reformas, Tecnologia, Educação, Saúde, etc.)

### 2. Autenticação
- Cadastro com email/senha e seleção de perfil (cliente ou prestador)
- Login com redirecionamento para dashboard
- Rotas protegidas: `/dashboard/*` requer autenticação
- Contexto de auth global com `onAuthStateChange`

### 3. Catálogo Público (`/services`)
- Listagem de serviços ativos com paginação
- Filtro por categoria
- Busca textual por título/descrição
- Ordenação: melhor avaliação, mais recentes, mais populares
- Cards com: título, preço, categoria, rating médio, localização

### 4. Página de Serviço (`/services/:id`)
- Detalhes completos do serviço
- Informações do prestador
- Lista de avaliações com rating médio
- Botão "Solicitar Serviço" (funcional na fase seguinte)
- Serviços similares (mesma categoria)

### 5. Layout & Design
- **Paleta:** Primária #2563EB, Secundária #10B981, Fundo #F9FAFB, Texto #111827
- Header com navegação (Home, Serviços, Login/Dashboard)
- Layout responsivo e acessível (aria-labels, foco visível, contraste WCAG AA)
- Estilo profissional, limpo e minimalista com shadcn/ui

### 6. Validação
- Zod para validação de formulários (cadastro, login)
- Sanitização de inputs
- provider_id sempre derivado do auth, nunca do frontend

---

**Próximas fases (não incluídas agora):**
- Fase 2: Sistema de Bookings completo + Dashboard
- Fase 3: Reviews + Motor de Recomendação

