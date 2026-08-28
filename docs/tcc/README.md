# TCC Hubservi — Material do Artigo Científico

Avaliação Técnica de uma Arquitetura Web baseada em BaaS/Serverless para Intermediação de Serviços — estudo de caso da plataforma **Hubservi**.

Este diretório reúne as seções do artigo (formato artigo científico, normas ABNT, citação autor-data) e os diagramas de apoio (UML, BPMN, DER em Mermaid). Cada arquivo foi escrito para ser colado diretamente no editor final (Word/LaTeX), preservando a numeração de seções.

## Arquivo consolidado

Para exportar de uma vez (Word/LaTeX), use [TCC-Hubservi.md](TCC-Hubservi.md) — concatena todas as seções na ordem do artigo, com os diagramas reunidos no Apêndice A e as referências ao final. É um arquivo **gerado**: para alterar o conteúdo, edite os arquivos-fonte individuais abaixo e regenere o consolidado.

## Ordem de montagem do artigo

| Ordem | Arquivo | Seção do artigo |
|-------|---------|-----------------|
| 1 | [00-pre-textual.md](00-pre-textual.md) | Título, resumo, palavras-chave, abstract |
| 2 | [01-introducao.md](01-introducao.md) | 1 Introdução (contexto, problema, questão, objetivos, delimitação do escopo, justificativa) |
| 3 | [02-referencial-teorico.md](02-referencial-teorico.md) | 2 Referencial teórico |
| 4 | [03-metodologia.md](03-metodologia.md) | 3 Metodologia |
| 5 | [04-arquitetura-hubservi.md](04-arquitetura-hubservi.md) | 4 Arquitetura do Hubservi |
| 6 | [05-planejamento-experimental.md](05-planejamento-experimental.md) | 5 Planejamento experimental e plano de métricas |
| 7 | [06-avaliacao-atam.md](06-avaliacao-atam.md) | 6 Plano de avaliação arquitetural (ATAM) |
| 8 | [07-resultados.md](07-resultados.md) | 7 Resultados |
| 9 | [08-conclusao.md](08-conclusao.md) | 8 Conclusão |
| 10 | [09-referencias.md](09-referencias.md) | Referências |

> **Versão de referência.** O artigo entregue é o `.docx`/`.pdf` gerado por [gerar-artigo-docx.py](gerar-artigo-docx.py) (`docs/Artigo_PedroConrado_RichardyRodrigues_ATUALIZADO.docx`), onde está o conteúdo definitivo — incluindo a Seção 1.8, as figuras de evidência da Seção 7.3 e o Apêndice C. Os arquivos por seção abaixo servem à edição e podem estar atrás dele em detalhes de redação.

**Apoio à defesa:** [10-apresentacao.md](10-apresentacao.md) — roteiro dos 10 minutos para 2 apresentadores (cronometragem, falas por slide e perguntas prováveis da banca). Não faz parte do corpo do artigo. As medições e evidências ficam em [medicoes/](medicoes/).

## Diagramas (Mermaid)

Em [diagramas/](diagramas/). Renderizam diretamente no GitHub e no preview de Markdown do VS Code.

| Artefato | Arquivo |
|----------|---------|
| DER (Entidade-Relacionamento) | [diagramas/der.md](diagramas/der.md) |
| Dicionário de dados | [diagramas/dicionario-de-dados.md](diagramas/dicionario-de-dados.md) |
| Diagrama de Casos de Uso | [diagramas/caso-de-uso.md](diagramas/caso-de-uso.md) |
| Diagrama de Classes | [diagramas/classes.md](diagramas/classes.md) |
| Sequência — Autenticação | [diagramas/sequencia-autenticacao.md](diagramas/sequencia-autenticacao.md) |
| Sequência — Contratação (booking) | [diagramas/sequencia-contratacao.md](diagramas/sequencia-contratacao.md) |
| Sequência — Avaliação (review) | [diagramas/sequencia-avaliacao.md](diagramas/sequencia-avaliacao.md) |
| Diagrama de Componentes | [diagramas/componentes.md](diagramas/componentes.md) |
| Diagrama de Implantação | [diagramas/implantacao.md](diagramas/implantacao.md) |
| BPMN — Contratação de serviço | [diagramas/bpmn-contratacao.md](diagramas/bpmn-contratacao.md) |
| BPMN — Gerenciamento de booking | [diagramas/bpmn-gerenciamento-booking.md](diagramas/bpmn-gerenciamento-booking.md) |

## Premissas adotadas (importantes para a banca)

1. **Objeto de pesquisa vs. instrumento (Seção 1.5):** o objeto do trabalho é a **avaliação técnica da arquitetura**; o Hubservi é o **instrumento** que a viabiliza. O sistema foi desenvolvido integralmente pela equipe, mas não é a contribuição científica — é pré-requisito metodológico dela: avaliar RLS, *triggers* e a fronteira cliente–BaaS exige acesso ao código, ao esquema e ao ambiente, inviável sobre plataforma de terceiros. A contribuição é o **procedimento de avaliação reprodutível**, transferível a outras aplicações BaaS.
2. **Modelo arquitetural:** SPA (Single Page Application) + BaaS (Backend as a Service) + Serverless. O Hubservi **não** adota microsserviços.
3. **Recomendação** é um módulo secundário (ordenação por popularidade/avaliação via view `service_stats`), não o tema do trabalho.
4. **Resultados quantitativos coletados.** A Seção 5 descreve o *planejamento* da avaliação; a Seção 7 reporta os **resultados das medições já executadas**. Todo número remete a uma evidência reprodutível em [`docs/tcc/medicoes/`](medicoes/) (ferramenta+versão, ambiente, data, arquivo de evidência) — nenhum valor é apresentado sem evidência correspondente.
5. Toda afirmação técnica sobre o banco (tabelas, RLS, triggers, views) foi derivada das migrations em [`supabase/migrations/`](../../supabase/migrations/) e do código em [`src/`](../../src/).
