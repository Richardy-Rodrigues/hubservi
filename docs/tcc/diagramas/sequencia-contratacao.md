# Diagrama de Sequência — Contratação (booking)

Solicitação de serviço pelo cliente e tratamento pelo prestador. Fonte: `src/components/BookingDialog.tsx`, `ServiceDetail.tsx`, dashboards, *triggers* `validate_booking_provider()` e `validate_booking_status_transition()`.

```mermaid
sequenceDiagram
    actor C as Cliente
    participant SD as ServiceDetail / BookingDialog
    participant API as Supabase (PostgREST)
    participant DB as PostgreSQL (RLS + triggers)
    actor P as Prestador
    participant PD as ProviderDashboard

    C->>SD: solicita serviço (mensagem, data)
    SD->>API: INSERT booking (status='pending', client_id=auth.uid())
    API->>DB: aplica RLS (cliente) + trigger validate_booking_provider
    DB-->>API: booking criado
    API-->>SD: confirmação
    SD-->>C: solicitação enviada

    Note over P,PD: Prestador acompanha no painel
    P->>PD: visualiza bookings recebidos
    PD->>API: SELECT bookings WHERE provider_id = auth.uid()
    API->>DB: aplica RLS (prestador)
    DB-->>PD: lista de bookings
    P->>PD: aceitar / rejeitar / concluir / cancelar
    PD->>API: UPDATE booking.status
    API->>DB: RLS (prestador) + trigger valida transição
    DB-->>API: status atualizado (ou erro se transição inválida)
    API-->>PD: resultado
```

## Notas

- O cliente também pode **cancelar** uma solicitação enquanto `status = 'pending'` (política RLS + transição `pending → cancelled`, migration `20260528000000`).
- Transições inválidas de status são rejeitadas pelo *trigger* com exceção.
