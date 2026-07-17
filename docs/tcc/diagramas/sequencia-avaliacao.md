# Diagrama de Sequência — Avaliação (review)

Registro de avaliação após booking concluído. Fonte: `src/components/ReviewForm.tsx`, `ServiceDetail.tsx`, política RLS de `INSERT` em `reviews`.

```mermaid
sequenceDiagram
    actor C as Cliente
    participant SD as ServiceDetail / ReviewForm
    participant API as Supabase (PostgREST)
    participant DB as PostgreSQL (RLS)

    C->>SD: abre serviço com booking concluído
    SD->>API: verifica elegibilidade (booking completed do cliente)
    API->>DB: SELECT bookings (RLS)
    DB-->>SD: elegível / não elegível
    C->>SD: envia avaliação (rating 1..5, comentário)
    SD->>API: INSERT review (client_id=auth.uid())
    API->>DB: RLS exige booking 'completed' + UNIQUE(service_id, client_id)
    alt Elegível e ainda não avaliou
        DB-->>API: review criada
        API-->>SD: sucesso
        SD->>API: invalida cache de reviews e service_stats
    else Não elegível ou duplicado
        DB-->>API: erro (RLS / unicidade)
        API-->>SD: falha
    end
    SD-->>C: feedback
```

## Notas

- A *view* `service_stats` recalcula `review_count` e `average_rating` ao ser consultada após a inserção.
- A unicidade `(service_id, client_id)` impede mais de uma avaliação por cliente por serviço.
