# Explicação das métricas — material para a apresentação

Este documento é a **contraparte narrativa** do [registro-medicoes.md](registro-medicoes.md). Enquanto o registro é a prova rigorosa (valor, ferramenta, versão, evidência, veredito), aqui cada métrica é explicada em **linguagem acessível**, pronta para virar slide ou fala de defesa: o que é, por que importa, quanto deu e o que aquele número significa.

**Como este documento evolui:** a cada nova medição registrada, acrescenta-se aqui a explicação correspondente. Os valores são atualizados conforme o sistema evolui, preservando o histórico (antes → depois) — porque a evolução dos números *é* parte do resultado do trabalho.

> Todos os valores abaixo remetem à data de coleta indicada. O histórico de cada métrica fica na própria seção, para que a apresentação possa mostrar a trajetória, não só o ponto final.

---

## Como ler estas métricas

As quatro categorias avaliadas vêm da norma **ISO/IEC 25010**, que define características de qualidade de software. O trabalho seleciona quatro delas — **segurança, eficiência de desempenho, manutenibilidade (com ênfase em testabilidade) e confiabilidade** — e, para cada uma, define cenários, métricas e critérios de aceitação (Seção 5 do artigo). Cada métrica abaixo pertence a uma dessas categorias.

Um princípio atravessa tudo: **medir → detectar → corrigir → re-medir.** Um número ruim no início não é fracasso; é o ponto de partida contra o qual o progresso é demonstrado. Números integralmente favoráveis logo na primeira medição indicariam, na verdade, que os cenários eram fracos demais para reprovar o sistema.

---

## Baseline — 15/07/2026 (Semana 1)

As três primeiras medições reais do trabalho. Retratam o ponto de partida antes de qualquer ampliação da suíte ou configuração de ferramentas de segurança e desempenho.

### M-01 — Cobertura de testes · **18,03%** · Testabilidade

**O que é.** Cobertura de testes mede quanto do código escrito pela equipe é efetivamente executado quando os testes automatizados rodam. `18%` significa que, de cada 100 linhas do código próprio, apenas ~18 são exercitadas por algum teste; as outras ~82 nunca são executadas durante os testes — se tiverem um defeito, nenhum teste avisaria.

**Analogia para o slide.** É como testar um carro ligando só o motor e o rádio, mas nunca os freios ou os faróis. O carro "passou no teste", mas 80% dele nunca foi acionado.

**Por que importa.** É a métrica da *testabilidade* — o quanto a arquitetura permite verificar seu próprio comportamento de forma automática. Numa arquitetura BaaS, em que a lógica se distribui entre o cliente e o banco, saber o que está e o que não está coberto é essencial.

**O que este número diz.** Dois detalhes contam a história real:
- **Onde há teste, o teste é bom.** `ProtectedRoute` 100%, `BookingDialog` 98,6%, `Dashboard` 100%, `ServiceForm` 82,8%. O problema não é qualidade, é *alcance*: falta cobrir mais arquivos (o `AuthContext`, o `ReviewForm` e outros estão em 0%).
- **A medição exclui o shadcn/ui.** 56% do código em `src/` é uma biblioteca de componentes de terceiros copiada para o projeto — código que a equipe não escreveu nem mantém. Medi-lo distorceria a avaliação da testabilidade do código próprio.

**Meta.** ≥70% nos módulos críticos (a ser calibrada na Semana 5). O baseline de 18% é o "antes"; a trajetória até a meta é o resultado.

*Histórico:* 15/07/2026 → 18,03% (linhas) / 67,9% (ramos).

### M-02 — Violações de lint · **19 erros** · Manutenibilidade

**O que é.** *Lint* é a análise automática do estilo e de antipadrões do código — um revisor automático que aponta construções problemáticas antes mesmo de o programa rodar. A métrica conta quantas violações a ferramenta (ESLint) encontra.

**Por que importa.** É um indicador de *manutenibilidade*: código com muitas violações é mais difícil de manter e evoluir com segurança. O critério do trabalho é "tendência a zero, sem erros".

**O que este número diz.** Hoje o comando de verificação termina **em erro** — o critério não é satisfeito. Das 19 violações, 16 são do tipo `no-explicit-any` (uso do tipo `any`, que desliga a verificação de tipos do TypeScript naquele ponto). Há uma nuance honesta a declarar na defesa: a configuração atual tem regras importantes *desligadas* e o TypeScript não opera em modo estrito, então **19 subestima o débito real**. A análise da Semana 7 vai comparar dois cenários — configuração atual vs. configuração com regras recomendadas — e discutir a diferença.

*Histórico:* 15/07/2026 → 19 erros, 9 avisos.

### M-03 — Dependências circulares · **0 ciclos** · Manutenibilidade

**O que é.** Uma dependência circular ocorre quando o módulo A depende do B, que depende do A (direta ou indiretamente). Ciclos tornam o código mais frágil e difícil de testar e refatorar. A ferramenta (Madge) varre o grafo de módulos e conta os ciclos.

**Por que importa.** Ausência de ciclos é sinal de boa *modularização* — um dos critérios de manutenibilidade do trabalho, cuja meta é exatamente zero.

**O que este número diz.** **0 ciclos em 85 arquivos.** É o único critério de manutenibilidade já satisfeito no baseline: a organização dos módulos do sistema é limpa nesse aspecto.

*Histórico:* 15/07/2026 → 0 ciclos.

---

## Resumo do baseline para um slide

| Métrica | Categoria | Valor (15/07) | Meta | Situação |
|---|---|---|---|---|
| Cobertura de testes | Testabilidade | 18,03% | ≥70% (módulos críticos) | Ponto de partida |
| Violações de lint | Manutenibilidade | 19 erros | ~0 | A tratar |
| Dependências circulares | Manutenibilidade | 0 | 0 | ✔ Atende |

**A frase da defesa:** "Começamos medindo com honestidade. Um dos três critérios já é atendido; os outros dois têm um ponto de partida claro e uma trajetória mensurável até a meta — e é essa trajetória, não um painel verde de fachada, que demonstra a evolução da qualidade da arquitetura."

---

## Achado da Semana 2 — o histórico não reproduz o sistema (F-01)

**O que aconteceu.** Para avaliar a segurança da arquitetura, primeiro montamos um ambiente de teste reproduzível: subimos o Supabase localmente e reconstruímos o banco **do zero**, aplicando apenas as *migrations* versionadas no projeto. O sistema não funcionou — toda tentativa de ler dados retornava "permissão negada".

**A causa.** As *migrations* versionadas não incluíam os comandos que dão aos usuários da API permissão de acesso às tabelas. Em produção o sistema funciona porque essas permissões foram aplicadas **por fora do versionamento** (provavelmente à mão — há um commit no histórico que menciona "migrations manuais no Supabase"). Ou seja: **o código versionado, sozinho, não recria o sistema que roda em produção.**

**Por que isso é um resultado, e não um contratempo.** Este é exatamente o tipo de fragilidade que a proposta do trabalho existe para revelar. Numa arquitetura BaaS, parte da configuração vive no serviço gerenciado e escapa do controle de versão com facilidade; só uma avaliação conduzida sobre um ambiente limpo e reproduzível expõe a lacuna. Corrigimos adicionando uma *migration* que torna o histórico **auto-suficiente** — sem alterar nenhuma regra de segurança.

**A conexão com o próximo capítulo (segurança).** Há uma ironia útil aqui: essa mesma permissão que faltava estava, sem querer, *escondendo* uma falha de segurança real. Sem a permissão de tabela, qualquer leitura de perfis falhava cedo demais para que a regra de segurança (o RLS) fosse sequer avaliada. Ao reproduzir a permissão correta, a regra de segurança volta a ser o único controle — e é aí que, na Semana 3, o furo de exposição de dados pessoais a usuários autenticados se torna visível e mensurável.

**A frase da defesa:** "Antes de medir segurança, tivemos que reconstruir o sistema do zero — e descobrimos que ele não se reconstruía sozinho. Essa é a primeira evidência concreta de que avaliar uma arquitetura BaaS exige um método reproduzível: o que não está no controle de versão não existe para quem tenta reproduzir o sistema."

*Histórico F-01:* detectado e corrigido em 16/07/2026 (migration `20260716120000`).
