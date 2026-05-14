# 08 — Diagrama de Componentes

Visao de componentes da SPA e da camada Supabase, derivada de [../02-architecture.md](../02-architecture.md) e da arvore em [../../src/](../../src/).

```mermaid
flowchart LR
    subgraph Browser
        direction TB
        IDX[Index]
        SVC[Services]
        DET[ServiceDetail]
        AUTH[Auth]
        DASH[Dashboard]
        PR[ProtectedRoute]
        BD[BookingDialog]
        SF[ServiceForm]
        CD[ClientDashboard]
        PD[ProviderDashboard]
        HDR[Header/Footer/Layout]
    end

    subgraph App[Camada de aplicacao]
        direction TB
        QC[QueryClientProvider]
        AC[AuthContext]
        RR[React Router]
        UI[shadcn/ui + Radix]
        TOAST[Toaster + Sonner]
    end

    subgraph SB[Supabase]
        direction TB
        SBA[Auth]
        PG[(Postgres)]
        RLS{{RLS policies}}
        TRG1[[handle_new_user]]
        TRG2[[validate_booking_status_transition]]
        TRG3[[update_updated_at_column]]
    end

    IDX --> RR
    SVC --> RR
    DET --> RR
    AUTH --> RR
    DASH --> PR
    PR --> AC

    DET --> BD
    DASH --> CD
    DASH --> PD
    PD --> SF

    BD --> AC
    SF --> AC
    CD --> AC
    PD --> AC

    AC --> SBA
    BD --> PG
    SF --> PG
    CD --> PG
    PD --> PG
    SVC --> PG
    DET --> PG

    PG --> RLS
    SBA --> TRG1
    PG --> TRG2
    PG --> TRG3

    QC -.-> Browser
    UI -.-> Browser
    TOAST -.-> Browser
```

## Notas

- O acesso de cada componente a `PG` na verdade passa pelo cliente em [../../src/integrations/supabase/client.ts](../../src/integrations/supabase/client.ts); o diagrama omite esse no para reduzir ruido.
- `ProtectedRoute` so libera filhos quando `AuthContext.session` esta presente; a selecao client vs provider acontece dentro do `Dashboard`.
- `handle_new_user` esta vinculado a `auth.users`, nao a uma tabela de `public`; representado como trigger de `SBA`.
