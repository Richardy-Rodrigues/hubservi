# Diagrama de Classes

Modelo de domínio derivado do esquema real (tabelas, enums e *views*). Não inclui entidades de recomendação/interação (inexistentes no sistema real).

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

    class PublicProfile {
        <<view>>
        +UUID id
        +string full_name
        +string avatar_url
        +UserType user_type
        +timestamptz created_at
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
    Profile "1" --> "*" Booking : como cliente
    Profile "1" --> "*" Booking : como prestador
    Service "1" --> "*" Review : recebe
    Profile "1" --> "*" Review : escreve
    Service "1" --> "1" ServiceStats : agrega
    Profile "1" --> "1" PublicProfile : projeta

    Profile ..> UserType
    Service ..> PriceType
    Booking ..> BookingStatus
```

## Notas

- `Profile.id` referencia `auth.users.id`; o *trigger* `handle_new_user` materializa o profile no cadastro.
- `Review` tem restrição `UNIQUE(service_id, client_id)`.
- `ServiceStats` e `PublicProfile` são *views* derivadas, não tabelas.
