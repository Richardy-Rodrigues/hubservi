# 04 - Data and Security

## PT-BR

### Banco de dados
Principais objetos no Postgres:
- profiles
- categories
- services
- bookings
- reviews
- service_stats (view)

Enums do dominio:
- user_type: client, provider
- price_type: fixed, hourly, negotiable
- booking_status: pending, accepted, completed, rejected, cancelled

### RLS (Row Level Security)
RLS esta habilitado nas tabelas de dominio.

Politicas principais:
- profiles: usuario acessa/atualiza o proprio profile; leitura publica habilitada
- services: leitura publica para servicos ativos; provider controla os proprios
- bookings: client e provider veem seus registros; provider atualiza status
- reviews: leitura publica; client gerencia review propria

### Triggers e funcoes
- handle_new_user: cria profile automatico no signup
- update_updated_at_column: atualiza timestamp de atualizacao
- validate_booking_status_transition: impede transicoes invalidas de status

Sincronizacao de profiles (migracao corretiva):
- trigger `on_auth_user_created` recriado de forma idempotente
- `handle_new_user` com upsert para evitar falhas em duplicidade
- backfill de `auth.users` para `public.profiles` quando houver lacunas
- policy `Users can insert own profile` para fallback seguro com RLS

### Seguranca de aplicacao
- Sessao gerida por Supabase Auth
- Rota privada protegida no frontend
- Guardas de papel no fluxo de booking/dashboard

### Pontos de endurecimento recomendados
- Validar no banco a coerencia de provider_id em bookings
- Restringir alteracao de campos sensiveis em profiles
- Adicionar testes de regressao de policies

## EN

### Database
Main Postgres objects:
- profiles
- categories
- services
- bookings
- reviews
- service_stats (view)

Domain enums:
- user_type: client, provider
- price_type: fixed, hourly, negotiable
- booking_status: pending, accepted, completed, rejected, cancelled

### RLS (Row Level Security)
RLS is enabled in domain tables.

Core policies:
- profiles: users can access/update own profile; public read is enabled
- services: public read for active services; providers control their own records
- bookings: clients and providers can view their own records; providers update status
- reviews: public read; clients manage their own reviews

### Triggers and functions
- handle_new_user: auto-creates profile on signup
- update_updated_at_column: updates row updated_at
- validate_booking_status_transition: blocks invalid status transitions

Profile sync (corrective migration):
- idempotent recreation of `on_auth_user_created` trigger
- `handle_new_user` uses upsert to avoid duplicate insertion failures
- backfill from `auth.users` to `public.profiles` for missing rows
- `Users can insert own profile` policy enables a safe RLS fallback

### Application security
- Session managed by Supabase Auth
- Private route protected in frontend
- Role guards in booking/dashboard flows

### Recommended hardening
- Enforce booking provider_id consistency at DB level
- Restrict sensitive profile field updates
- Add policy regression tests
