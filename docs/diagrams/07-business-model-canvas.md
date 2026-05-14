# 07 — Business Model Canvas

Mermaid nao tem canvas nativo; usamos `flowchart TB` com 9 subgraphs simulando os blocos. Setas indicam relacoes principais entre blocos.

Fontes: [../01-overview.md](../01-overview.md), [../03-business-rules.md](../03-business-rules.md).

```mermaid
flowchart TB
    subgraph P1[1. Parceiros-chave]
        p1a[Supabase Auth e Postgres]
        p1b[Provedores de pagamento - futuro]
        p1c[Provedores de notificacao - futuro]
    end

    subgraph P2[2. Atividades-chave]
        p2a[Curadoria de categorias]
        p2b[Matching cliente-prestador]
        p2c[Gestao de bookings]
        p2d[Moderacao de reviews]
    end

    subgraph P3[3. Recursos-chave]
        p3a[Plataforma SPA React]
        p3b[Base de prestadores]
        p3c[Schema com RLS]
    end

    subgraph P4[4. Proposta de valor]
        p4a[Encontrar servicos de forma confiavel]
        p4b[Publicar oferta sem custo de tecnologia]
        p4c[Historico e reputacao via reviews]
    end

    subgraph P5[5. Relacionamento com clientes]
        p5a[Self-service na SPA]
        p5b[Reputacao via reviews]
        p5c[Suporte por toast/UX]
    end

    subgraph P6[6. Canais]
        p6a[Web SPA - Vite]
        p6b[Email transacional - futuro]
    end

    subgraph P7[7. Segmentos de clientes]
        p7a[Client: busca servicos]
        p7b[Provider: oferta servicos]
    end

    subgraph P8[8. Estrutura de custos]
        p8a[Supabase plan]
        p8b[Hospedagem frontend]
        p8c[Desenvolvimento]
    end

    subgraph P9[9. Fontes de receita]
        p9a[A definir: fee por transacao]
        p9b[A definir: assinatura premium]
    end

    P2 --> P4
    P3 --> P2
    P4 --> P7
    P5 --> P7
    P6 --> P7
    P1 --> P3
    P7 --> P9
    P1 --> P8
```

## Notas

- Os blocos `P9` e parte de `P1`/`P6` estao "a definir" no escopo atual: o produto ainda nao tem fluxo de pagamento nem notificacao por email.
- A proposta de valor `p4b` (publicar oferta sem custo de tecnologia) pressupoe modelo freemium para providers.
