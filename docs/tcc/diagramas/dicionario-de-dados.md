# Dicionário de dados

Derivado das *migrations* em `supabase/migrations/` (migration inicial `20260303232457_*` e posteriores). Tipos conforme PostgreSQL.

## Enumerações

| Tipo | Valores |
|------|---------|
| `user_type` | `client`, `provider` |
| `price_type` | `fixed`, `hourly`, `negotiable` |
| `booking_status` | `pending`, `accepted`, `completed`, `rejected`, `cancelled` |

## Tabela `profiles`

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | uuid | PK; FK → `auth.users(id)` ON DELETE CASCADE | Identificador do usuário |
| `email` | text | UNIQUE, NOT NULL | E-mail (sincronizado do Auth) — **PII** |
| `full_name` | text | NOT NULL, DEFAULT '' | Nome de exibição |
| `phone` | text | DEFAULT '' | Telefone — **PII** |
| `avatar_url` | text | DEFAULT '' | URL do avatar |
| `user_type` | user_type | NOT NULL, DEFAULT 'client'; imutável (*trigger*) | Papel do usuário |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Criação |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Atualização (*trigger*) |

## Tabela `categories`

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | Identificador |
| `name` | text | UNIQUE, NOT NULL | Nome da categoria |
| `description` | text | DEFAULT '' | Descrição |
| `icon` | text | DEFAULT '' | Ícone (UI) |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Criação |

## Tabela `services`

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | Identificador |
| `provider_id` | uuid | NOT NULL, FK → `profiles(id)` ON DELETE CASCADE | Prestador dono |
| `category_id` | uuid | NOT NULL, FK → `categories(id)` ON DELETE RESTRICT | Categoria |
| `title` | text | NOT NULL | Título |
| `description` | text | NOT NULL, DEFAULT '' | Descrição |
| `price_min` | numeric(10,2) | NOT NULL, DEFAULT 0 | Preço mínimo |
| `price_max` | numeric(10,2) | CHECK (`price_max IS NULL OR price_max >= price_min`) | Preço máximo (opcional) |
| `price_type` | price_type | NOT NULL, DEFAULT 'fixed' | Modelo de preço |
| `location` | text | DEFAULT '' | Localidade |
| `is_active` | boolean | NOT NULL, DEFAULT true | Visibilidade pública |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Criação |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Atualização (*trigger*) |

Índices: `provider_id`, `category_id`, `is_active`, e índice GIN de busca textual sobre `title`.

## Tabela `bookings`

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | Identificador |
| `service_id` | uuid | NOT NULL, FK → `services(id)` ON DELETE CASCADE | Serviço |
| `client_id` | uuid | NOT NULL, FK → `profiles(id)` ON DELETE CASCADE | Cliente |
| `provider_id` | uuid | NOT NULL, FK → `profiles(id)` ON DELETE CASCADE | Prestador (deve coincidir com o dono do serviço — *trigger*) |
| `status` | booking_status | NOT NULL, DEFAULT 'pending'; transições validadas (*trigger*) | Estado |
| `message` | text | DEFAULT '' | Mensagem da solicitação |
| `scheduled_date` | timestamptz | NULL | Data agendada |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Criação |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Atualização (*trigger*) |

Índices: `client_id`, `provider_id`, `service_id`.

## Tabela `reviews`

| Coluna | Tipo | Restrições | Descrição |
|--------|------|-----------|-----------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | Identificador |
| `service_id` | uuid | NOT NULL, FK → `services(id)` ON DELETE CASCADE | Serviço avaliado |
| `client_id` | uuid | NOT NULL, FK → `profiles(id)` ON DELETE CASCADE | Autor (cliente) |
| `provider_id` | uuid | NOT NULL, FK → `profiles(id)` ON DELETE CASCADE | Prestador avaliado |
| `rating` | integer | NOT NULL, CHECK (1 ≤ rating ≤ 5) | Nota |
| `comment` | text | NOT NULL, DEFAULT '' | Comentário |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Criação |
| — | — | UNIQUE (`service_id`, `client_id`) | Uma avaliação por cliente por serviço |

Índices: `service_id`, `client_id`.

## Views

| View | Colunas | Descrição |
|------|---------|-----------|
| `service_stats` | `service_id`, `review_count` (int), `average_rating` (numeric(3,2)) | Agregação de avaliações por serviço; `security_invoker = true` |
| `public_profiles` | `id`, `full_name`, `avatar_url`, `user_type`, `created_at` | Projeção sem PII (omite `email` e `phone`) para consumo anônimo |
