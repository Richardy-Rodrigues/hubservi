# DER — Diagrama Entidade-Relacionamento

Modelo de dados do Hubservi, fiel ao esquema real das *migrations* (`supabase/migrations/`). As *views* `service_stats` e `public_profiles` são derivadas e não aparecem como entidades persistentes.

```mermaid
erDiagram
    PROFILES ||--o{ SERVICES : "oferece (provider_id)"
    CATEGORIES ||--o{ SERVICES : "classifica (category_id)"
    SERVICES ||--o{ BOOKINGS : "solicitado em (service_id)"
    PROFILES ||--o{ BOOKINGS : "como cliente (client_id)"
    PROFILES ||--o{ BOOKINGS : "como prestador (provider_id)"
    SERVICES ||--o{ REVIEWS : "recebe (service_id)"
    PROFILES ||--o{ REVIEWS : "escreve (client_id)"
    PROFILES ||--o{ REVIEWS : "avaliado (provider_id)"

    PROFILES {
        uuid id PK "FK -> auth.users.id"
        text email UK
        text full_name
        text phone
        text avatar_url
        user_type user_type "client | provider"
        timestamptz created_at
        timestamptz updated_at
    }

    CATEGORIES {
        uuid id PK
        text name UK
        text description
        text icon
        timestamptz created_at
    }

    SERVICES {
        uuid id PK
        uuid provider_id FK
        uuid category_id FK
        text title
        text description
        numeric price_min
        numeric price_max
        price_type price_type "fixed | hourly | negotiable"
        text location
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    BOOKINGS {
        uuid id PK
        uuid service_id FK
        uuid client_id FK
        uuid provider_id FK
        booking_status status "pending | accepted | completed | rejected | cancelled"
        text message
        timestamptz scheduled_date
        timestamptz created_at
        timestamptz updated_at
    }

    REVIEWS {
        uuid id PK
        uuid service_id FK
        uuid client_id FK
        uuid provider_id FK
        int rating "CHECK 1..5"
        text comment
        timestamptz created_at
    }
```

## Notas

- `PROFILES.id` referencia `auth.users.id` (tabela gerenciada pelo Supabase Auth); o *trigger* `handle_new_user()` materializa o perfil no cadastro.
- `REVIEWS` possui restrição de unicidade `UNIQUE(service_id, client_id)`: uma avaliação por cliente por serviço.
- `SERVICES` possui a restrição `CHECK (price_max IS NULL OR price_max >= price_min)`.
- Exclusões em cascata: a remoção de um `profile`/`service` propaga-se aos `bookings` e `reviews` relacionados (`ON DELETE CASCADE`); `services.category_id` usa `ON DELETE RESTRICT`.
