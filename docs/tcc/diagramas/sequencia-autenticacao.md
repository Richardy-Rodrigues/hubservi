# Diagrama de Sequência — Autenticação

Fluxo de cadastro/login com provisão automática de perfil. Fonte: `src/pages/Auth.tsx`, `src/contexts/AuthContext.tsx`, *trigger* `handle_new_user()`.

```mermaid
sequenceDiagram
    actor U as Usuário
    participant Auth as Auth.tsx (SPA)
    participant Ctx as AuthContext
    participant SB as Supabase Auth
    participant DB as PostgreSQL

    U->>Auth: preenche cadastro (email, senha, full_name, user_type)
    Auth->>Auth: valida com Zod
    Auth->>SB: signUp(email, senha, metadata)
    SB->>DB: INSERT em auth.users
    DB-->>DB: trigger on_auth_user_created -> handle_new_user()
    DB->>DB: INSERT/UPSERT em profiles
    SB-->>Auth: sessão (ou confirmação de e-mail)
    SB-->>Ctx: onAuthStateChange(session)
    Ctx->>DB: SELECT profile WHERE id = auth.uid()
    DB-->>Ctx: profile (respeitando RLS)
    Ctx-->>Auth: { user, profile, session }
    Auth-->>U: redireciona ao dashboard
```

## Notas

- A criação do perfil ocorre no servidor, via *trigger* idempotente (`ON CONFLICT DO UPDATE`), independente das políticas de RLS (`SECURITY DEFINER`).
- O `AuthContext` mantém a sessão e o perfil em memória, recarregando-os a cada mudança de estado de autenticação.
