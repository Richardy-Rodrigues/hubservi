# 02 — Diagrama de Caso de Uso

Mermaid nao tem `usecaseDiagram`, entao usamos `flowchart LR` com dois subgraphs: atores a esquerda e casos de uso dentro do sistema. Casos sao representados por nos elipticos `(( ))`.

Fonte: "Funcionalidades principais" em [../01-overview.md](../01-overview.md) e regras em [../03-business-rules.md](../03-business-rules.md).

```mermaid
flowchart LR
    V([Visitante])
    C([Client])
    P([Provider])
    A[[Supabase Auth]]

    subgraph Sistema_Hubservi
        UC1((Buscar servicos))
        UC2((Ver detalhe de servico))
        UC3((Autenticar / Cadastrar))
        UC4((Solicitar booking))
        UC5((Gerenciar proprios servicos))
        UC6((Gerenciar bookings recebidos))
        UC7((Acompanhar bookings))
        UC8((Avaliar servico))
    end

    V --> UC1
    V --> UC2
    V --> UC3

    C --> UC1
    C --> UC2
    C --> UC4
    C --> UC7
    C --> UC8

    P --> UC5
    P --> UC6

    UC3 -.->|include| A
    UC4 -.->|include| UC3
    UC5 -.->|include| UC3
    UC6 -.->|include| UC3
    UC7 -.->|include| UC3
    UC8 -.->|include| UC3
```

## Notas

- Visitante so acessa fluxos publicos (`/`, `/services`, `/services/:id`, `/auth`).
- Toda interacao com dados protegidos depende do caso "Autenticar" — modelado com relacoes `<<include>>` (tracejadas).
- Provider nao aparece em "Solicitar booking" porque a regra de negocio impede solicitar o proprio servico (ver [BookingDialog.tsx:42-48](../../src/components/BookingDialog.tsx#L42-L48)).
