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

---

## Segurança (Semana 3) — dois furos reais, achados e fechados

Esta é a categoria central do trabalho: numa arquitetura BaaS, o banco de dados *é* a API, e a segurança depende de regras declarativas (RLS e *triggers*) escritas corretamente. Testamos essas regras como um atacante faria — autenticando-nos como cada tipo de usuário e tentando acessar o que não deveríamos. Encontramos dois furos reais.

### Furo 1 — dados pessoais visíveis a qualquer usuário logado (F-02)

**Em uma frase.** Qualquer pessoa com uma conta na plataforma conseguia ler o **e-mail e o telefone de todos os outros usuários**.

**Como demonstramos.** Autenticados como um cliente comum, pedimos ao banco o e-mail de outro usuário — e ele veio (`provider_b@test.local`). O teste que exige "nenhum dado pessoal de terceiros deve vazar" falhou, provando o furo.

**A causa.** A regra de segurança dizia, em essência, "qualquer usuário autenticado pode ler a tabela de perfis" — sem restringir a ler apenas o próprio. Os dados públicos (nome, foto) já eram servidos por um canal separado e seguro; a tabela completa, com os dados sensíveis, nunca deveria ter ficado aberta.

**A correção.** Restringimos a leitura direta da tabela de perfis ao próprio registro do usuário. Confirmamos, antes, que a aplicação já obtinha os dados públicos de terceiros por outro caminho — então a correção fechou o vazamento **sem quebrar nada**.

### Furo 2 — avaliação atribuída ao prestador errado (F-03)

**Em uma frase.** Um cliente conseguia publicar uma avaliação **no nome de um prestador que nunca lhe prestou serviço**.

**Como demonstramos.** Com um serviço legítimo do prestador A e um atendimento concluído, publicamos a avaliação apontando-a para o prestador B. O banco aceitou. O teste que exige "só se pode avaliar o dono real do serviço" falhou.

**A causa — e a lição.** O sistema *já tinha* uma verificação idêntica para os agendamentos, mas **esqueceram de replicá-la para as avaliações**. É a tese do trabalho em estado puro: numa arquitetura BaaS, cada regra precisa ser declarada explicitamente no banco; onde a equipe esqueceu, não há uma camada de aplicação para salvar.

**A correção.** Adicionamos às avaliações a mesma verificação que já protegia os agendamentos.

### O padrão que sustenta a defesa

Os dois furos seguem o mesmo ciclo, e é ele que dá credibilidade ao trabalho: **medir → detectar → corrigir → re-medir.** Guardamos a evidência dos dois estados — o registro do sistema *reprovando* (2 testes vermelhos) e depois *aprovando* (11 verdes). 

**A frase da defesa:** "Não construímos testes para confirmar que o sistema estava bom — construímos para descobrir onde estava ruim. Achamos dois vazamentos reais de segurança que a inspeção visual não pegou, mostramos exatamente como explorá-los, corrigimos e provamos a correção. Um conjunto de testes que só mostra tela verde não teria valor nenhum; o valor está em ter, primeiro, a tela vermelha."

*Histórico:* F-02 e F-03 detectados e corrigidos em 16/07/2026 (migrations `20260716130000` e `20260716130100`).

---

## Testabilidade (Semana 5) — a cobertura saiu de 18% para 32%

**O número.** A cobertura de testes subiu de **18% para 32%** das linhas do código próprio. Mas o número global conta só metade da história — o que importa é *onde* o teste está.

**A estratégia — cobrir o que é crítico, não o que é fácil.** Em vez de perseguir um número global bonito, concentramos o esforço nos módulos que carregam a lógica sensível do sistema. Esses agora estão entre **82% e 100%** cobertos: o contexto de autenticação, o formulário de avaliação, o de perfil, as validações de formulário e o acesso à camada de dados. As telas grandes de listagem, que são muito código e pouca lógica de decisão, ficaram para depois — e é por isso que o número global ainda é modesto.

**A decisão metodológica (boa resposta de banca).** O plano do TCC dizia "cobertura ≥70% nos módulos críticos, a definir". Nós *definimos* — e essa definição é uma contribuição em si. Estabelecemos duas travas automáticas: um piso global baixo, que só impede piorar, e um piso alto (≥75%) em cada módulo crítico, **listado nominalmente**. Se alguém, no futuro, mexer no contexto de autenticação e a cobertura dele cair, o próprio comando de teste falha. Decidir explicitamente o que merece rigor é mais honesto do que exibir uma média global que esconde os pontos frágeis.

**Ganho de engenharia junto.** Criamos uma "fábrica de simulação" do banco de dados reutilizável, que substituiu o código de teste repetitivo e frágil que existia antes. Isso não muda a nota de cobertura, mas torna os próximos testes mais rápidos de escrever — um sinal de que a *testabilidade* da arquitetura, que é o atributo sob avaliação, de fato melhorou.

**A frase da defesa:** "Cobertura de teste não é um número para enfeitar slide. Subimos de 18% para 32%, mas o essencial é que os módulos que decidem quem acessa o quê estão acima de 80%, com uma trava automática que impede regressão. Medimos, e depois protegemos o que medimos."

*Histórico:* suíte unitária de 11 → 44 testes; cobertura global 18% → 32%; limiares aplicados em 16/07/2026.
