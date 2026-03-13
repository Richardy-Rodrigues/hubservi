# 02 - Architecture

## PT-BR

### Arquitetura geral
Modelo SPA com frontend React e backend serverless via Supabase.

Camadas:
1. Apresentacao: paginas e componentes
2. Aplicacao: contexto de auth, regras de fluxo, mutacoes
3. Dados: Supabase client, Postgres, RLS, triggers

### Fluxo de rotas
- /: landing page
- /auth: autenticacao
- /services: busca/listagem de servicos
- /services/:id: detalhe de servico
- /dashboard: rota protegida por autenticacao

### Providers globais
- QueryClientProvider: cache e sincronizacao de dados
- TooltipProvider, Toaster, Sonner: UX
- BrowserRouter: roteamento
- AuthProvider: sessao e profile do usuario

### Controle de acesso
- ProtectedRoute bloqueia usuarios sem sessao
- Dashboard seleciona UI por profile.user_type

### Padroes de componentes
- Components de negocio: BookingDialog, ServiceForm, dashboards
- Components de UI reutilizaveis em src/components/ui
- Layout composicional com Header, Footer e container principal

## EN

### Overall architecture
SPA model with React frontend and Supabase serverless backend.

Layers:
1. Presentation: pages and components
2. Application: auth context, flow rules, mutations
3. Data: Supabase client, Postgres, RLS, triggers

### Route flow
- /: landing page
- /auth: authentication
- /services: service listing/search
- /services/:id: service detail
- /dashboard: auth-protected route

### Global providers
- QueryClientProvider: data caching and synchronization
- TooltipProvider, Toaster, Sonner: UX feedback
- BrowserRouter: routing
- AuthProvider: user session and profile

### Access control
- ProtectedRoute blocks users without an active session
- Dashboard renders role-based UI from profile.user_type

### Component patterns
- Business components: BookingDialog, ServiceForm, dashboards
- Reusable UI components under src/components/ui
- Compositional layout with Header, Footer, and main container
