# Diagrama de Componentes

Componentes lógicos do Hubservi e suas dependências. Fonte: `src/`.

```mermaid
flowchart TB
    subgraph Cliente["React SPA (navegador)"]
        direction TB
        Router[App / React Router]
        Pages[Páginas<br/>Index, Auth, Services, ServiceDetail, Dashboard]
        Comps[Componentes de negócio<br/>BookingDialog, ReviewForm, ServiceForm, ProfileForm]
        Dash[Dashboards<br/>ClientDashboard, ProviderDashboard]
        UI[shadcn/ui - Radix + Tailwind]
        Auth[AuthContext]
        RQ[React Query]
        Integ[integrations/supabase<br/>client, views, types]
    end

    subgraph BaaS["Supabase"]
        SupAuth[Auth]
        Rest[API PostgREST]
    end

    subgraph Banco["PostgreSQL"]
        Tab[Tabelas + Views]
        RLS[RLS / Policies / Triggers]
    end

    Router --> Pages
    Pages --> Comps
    Pages --> Dash
    Pages --> UI
    Comps --> UI
    Pages --> Auth
    Comps --> RQ
    Dash --> RQ
    Auth --> Integ
    RQ --> Integ
    Integ --> SupAuth
    Integ --> Rest
    SupAuth --> Tab
    Rest --> Tab
    Tab --- RLS
```

## Notas

- `integrations/supabase/client.ts` é o ponto único de acesso ao BaaS; `views.ts` encapsula consultas à *view* `public_profiles`.
- Toda autorização é aplicada na camada de banco (RLS), não no cliente; o cliente apenas reflete as restrições.
