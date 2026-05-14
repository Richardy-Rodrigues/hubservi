# 01 — BPMN: Fluxo de Booking

Aproxima a notacao BPMN 2.0 com `flowchart LR`. Cobre desde o cliente abrir o detalhe de um servico ate o booking terminar em `completed`, `rejected` ou `cancelled`.

Fontes:
- Regras em [../03-business-rules.md](../03-business-rules.md)
- Validacao de transicoes em [../../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql](../../supabase/migrations/20260303232457_a8395b1c-7eb2-41e8-91a6-2cee18542cc2.sql) (funcao `validate_booking_status_transition`)
- Implementacao da solicitacao em [../../src/components/BookingDialog.tsx](../../src/components/BookingDialog.tsx)

Legenda: `(())` evento, `{}` gateway, `[]` tarefa, `[/.../]` mensagem.

```mermaid
flowchart LR
    subgraph Cliente
        S((Inicio: abre detalhe do servico)) --> AUTH{Autenticado?}
        AUTH -- Nao --> LOGIN[Ir para /auth]
        LOGIN --> AUTH
        AUTH -- Sim --> OWN{client = provider?}
        OWN -- Sim --> BLOCK[Botao oculto]
        OWN -- Nao --> FORM[Preencher mensagem e data]
        FORM --> SEND[/INSERT bookings status=pending/]
    end

    subgraph Sistema
        SEND --> RLS{RLS: auth.uid = client_id?}
        RLS -- Nao --> ERR((Fim: erro))
        RLS -- Sim --> SAVED[Booking criado pending]
        SAVED --> NOTIFY[/Notifica provider/]
    end

    subgraph Prestador
        NOTIFY --> DEC{Decisao}
        DEC -- Aceitar --> ACC[UPDATE status=accepted]
        DEC -- Rejeitar --> REJ[UPDATE status=rejected]
        ACC --> TRG1{Trigger valida transicao}
        REJ --> TRG2{Trigger valida transicao}
        TRG2 --> END_REJ((Fim: rejected))
        TRG1 --> POST{Conclusao}
        POST -- Concluir --> COMP[UPDATE status=completed]
        POST -- Cancelar --> CAN[UPDATE status=cancelled]
        COMP --> END_OK((Fim: completed))
        CAN --> END_CAN((Fim: cancelled))
    end

    BLOCK --> END_BLK((Fim: nao se aplica))
```

## Notas

- O trigger `validate_booking_status_transition` impede transicoes invalidas; o gateway "Trigger valida transicao" representa esse ponto de controle.
- As policies de RLS de bookings garantem que o `INSERT` so passa quando `auth.uid() = client_id` e que apenas o provider correspondente atualiza o status.
