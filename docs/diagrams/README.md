# Diagramas — Hubservi

Esta pasta consolida os diagramas tecnicos e de negocio derivados dos documentos em [../](../). Todos os diagramas usam Mermaid, renderizado nativamente no GitHub e em viewers Markdown.

## Indice

| # | Diagrama | Tipo | Fonte principal |
| --- | --- | --- | --- |
| 01 | [BPMN — Booking](./01-bpmn-booking.md) | `flowchart LR` (BPMN-like) | [03-business-rules.md](../03-business-rules.md) |
| 02 | [Caso de Uso](./02-use-case.md) | `flowchart LR` | [01-overview.md](../01-overview.md) |
| 03 | [Classe UML](./03-class-uml.md) | `classDiagram` | [04-data-and-security.md](../04-data-and-security.md) + migrations |
| 04 | [Sequencia — solicitar servico](./04-sequence-booking.md) | `sequenceDiagram` | [BookingDialog.tsx](../../src/components/BookingDialog.tsx) |
| 05 | [EAP](./05-eap.md) | `flowchart TD` | [05-development-and-quality.md](../05-development-and-quality.md) |
| 06 | [SWOT](./06-swot.md) | `quadrantChart` | docs 04 e 05 |
| 07 | [Business Model Canvas](./07-business-model-canvas.md) | `flowchart TB` (9 blocos) | [01-overview.md](../01-overview.md) |
| 08 | [Componentes](./08-component-diagram.md) | `flowchart LR` | [02-architecture.md](../02-architecture.md) |

## Convencoes

- Idioma: PT-BR. Nomes de tabelas, colunas e enums seguem o schema (ingles).
- Cada arquivo abre com 2-3 linhas de contexto e link para a fonte.
- Em diagramas que aproximam notacoes nao-nativas do Mermaid (BPMN, Caso de Uso, Canvas), uma legenda explica o mapeamento de simbolos.

## Legenda BPMN (arquivo 01)

| Forma Mermaid | Significado BPMN |
| --- | --- |
| `((Texto))` | Evento (inicio ou fim) |
| `{Texto?}` | Gateway de decisao |
| `[Texto]` | Tarefa / atividade |
| `[/Texto/]` | Mensagem (entrada/saida) |
| `subgraph Raia` | Raia (lane) do ator responsavel |

## Como atualizar

Quando algum dos docs 01-05 mudar, revise o diagrama correspondente. Para validar sintaxe, abra o `.md` no preview do VS Code (extensao Markdown Preview Mermaid Support) ou diretamente no GitHub.
