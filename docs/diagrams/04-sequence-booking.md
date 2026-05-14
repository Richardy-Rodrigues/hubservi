# 04 — Sequencia: Client solicita servico e Provider aceita

Cobre dois fluxos encadeados: o INSERT em `bookings` feito por `BookingDialog` e o UPDATE de status feito pelo provider, validado pelo trigger.

Fontes:
- [../../src/components/BookingDialog.tsx](../../src/components/BookingDialog.tsx)
- [../../src/contexts/AuthContext.tsx](../../src/contexts/AuthContext.tsx)
- RLS e triggers em [../04-data-and-security.md](../04-data-and-security.md)

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Dialog as BookingDialog
    participant Ctx as AuthContext
    participant SB as Supabase JS Client
    participant RLS as RLS (Postgres)
    participant Tbl as bookings
    participant Trg as validate_booking_status_transition

    Client->>Dialog: Clica "Solicitar Servico"
    Dialog->>Ctx: useAuth() user, profile
    alt Sem sessao
        Dialog-->>Client: Redireciona /auth
    else Provider tentando solicitar
        Dialog-->>Client: Botao oculto (regra de negocio)
    else Client autenticado
        Client->>Dialog: Preenche mensagem + data
        Dialog->>SB: from("bookings").insert(...)
        SB->>RLS: INSERT com auth.uid()
        RLS->>RLS: Checa "auth.uid() = client_id"
        alt Policy nega
            RLS-->>SB: Erro
            SB-->>Dialog: error
            Dialog-->>Client: Toast erro
        else Policy aceita
            RLS->>Tbl: INSERT status=pending
            Tbl-->>SB: OK
            SB-->>Dialog: success
            Dialog-->>Client: Toast "Solicitacao enviada"
        end
    end

    Note over Tbl: Provider abre seu dashboard

    actor Provider
    Provider->>SB: UPDATE bookings SET status='accepted'
    SB->>RLS: Checa "auth.uid() = provider_id"
    RLS->>Trg: BEFORE UPDATE OF status
    alt Transicao invalida
        Trg-->>RLS: RAISE EXCEPTION
        RLS-->>SB: Erro
        SB-->>Provider: error
    else pending -> accepted
        Trg-->>RLS: OK
        RLS->>Tbl: persiste status=accepted
        Tbl-->>SB: OK
        SB-->>Provider: success
    end
```

## Notas

- O `setTimeout` em [AuthContext.tsx:46](../../src/contexts/AuthContext.tsx#L46) existe para evitar deadlocks com a callback do `onAuthStateChange`; nao impacta o fluxo de booking, mas e relevante ao entender a hidratacao do `profile`.
- O trigger so libera `pending -> accepted|rejected` e `accepted -> completed|cancelled`; qualquer outra transicao lanca excecao.
