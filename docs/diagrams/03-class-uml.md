# 03 — Diagrama de Classes UML

Modelo de dominio derivado das tabelas do schema e dos enums.

Fonte: [../../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql](../../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql).

```mermaid
classDiagram
    class Profile {
        +UUID id
        +string email
        +string full_name
        +string phone
        +string avatar_url
        +UserType user_type
        +timestamptz created_at
        +timestamptz updated_at
    }

    class Category {
        +UUID id
        +string name
        +string description
        +string icon
        +timestamptz created_at
    }

    class Service {
        +UUID id
        +UUID provider_id
        +UUID category_id
        +string title
        +string description
        +numeric price_min
        +numeric price_max
        +PriceType price_type
        +string location
        +bool is_active
        +timestamptz created_at
        +timestamptz updated_at
    }

    class Booking {
        +UUID id
        +UUID service_id
        +UUID client_id
        +UUID provider_id
        +BookingStatus status
        +string message
        +timestamptz scheduled_date
        +timestamptz created_at
        +timestamptz updated_at
    }

    class Review {
        +UUID id
        +UUID service_id
        +UUID client_id
        +UUID provider_id
        +int rating
        +string comment
        +timestamptz created_at
    }

    class ServiceStats {
        <<view>>
        +UUID service_id
        +int review_count
        +numeric average_rating
    }

    class UserType {
        <<enumeration>>
        client
        provider
    }

    class PriceType {
        <<enumeration>>
        fixed
        hourly
        negotiable
    }

    class BookingStatus {
        <<enumeration>>
        pending
        accepted
        completed
        rejected
        cancelled
    }

    Profile "1" --> "*" Service : oferece
    Category "1" --> "*" Service : classifica
    Service "1" --> "*" Booking : possui
    Profile "1" --> "*" Booking : como client
    Profile "1" --> "*" Booking : como provider
    Service "1" --> "*" Review : recebe
    Profile "1" --> "*" Review : escreve
    Service "1" --> "1" ServiceStats : agrega

    Profile ..> UserType
    Service ..> PriceType
    Booking ..> BookingStatus
```

## Notas

- `Profile.id` referencia `auth.users.id`; o trigger `handle_new_user` materializa o profile no signup.
- `Review` tem restricao `UNIQUE(service_id, client_id)` — uma avaliacao por cliente por servico.
- `ServiceStats` e uma view derivada de `Review` agrupada por `service_id`.
