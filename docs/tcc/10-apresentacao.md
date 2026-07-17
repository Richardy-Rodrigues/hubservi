# 10 Roteiro de apresentação (defesa — 10 minutos, 2 apresentadores)

Roteiro para a defesa oral. **Tempo total: 10 minutos.** Dois apresentadores, com
divisão equilibrada e um único *handoff* no meio. As "falas-chave" são o que
**precisa** ser dito em cada slide; o resto é apoio. Os números conferem com a
Seção 7 e com o registro em [`medicoes/`](medicoes/).

- **Apresentador A** — abertura e fundamentos (slides 1–5, ~4:30).
- **Apresentador B** — resultados e contribuição (slides 6–11, ~5:00).
- ~0:30 de folga para respiração/transição.

> **Regra de ouro do tempo:** se estiver atrasando, corte detalhe dos slides 4 e 8,
> nunca o slide 3 (escopo) nem o 7 (segurança) — são o coração da defesa.

---

## Divisão e cronometragem

| # | Slide | Quem | Tempo | Acumulado |
|---|-------|------|-------|-----------|
| 1 | Capa / título | A | 0:15 | 0:15 |
| 2 | O problema | A | 1:00 | 1:15 |
| 3 | Objeto vs. instrumento (escopo) | A | 1:00 | 2:15 |
| 4 | O sistema Hubservi (o laboratório) | A | 1:15 | 3:30 |
| 5 | O método de avaliação | A | 1:00 | 4:30 |
| — | **HANDOFF** | A→B | — | 4:30 |
| 6 | Achado transversal: reprodutibilidade | B | 1:00 | 5:30 |
| 7 | Segurança (o núcleo) | B | 1:30 | 7:00 |
| 8 | Confiabilidade + Testabilidade | B | 1:00 | 8:00 |
| 9 | Desempenho + Manutenibilidade | B | 1:15 | 9:15 |
| 10 | Contribuição e conclusão | B | 0:40 | 9:55 |
| 11 | Encerramento / perguntas | B (+A) | 0:05 | 10:00 |

---

## Slide 1 — Capa (A · 0:15)

**Mostrar:** título completo, nomes dos dois autores, orientador, instituição, data.

> "Avaliação Técnica de uma Arquitetura Web baseada em BaaS/Serverless para
> Intermediação de Serviços — um estudo de caso da plataforma Hubservi."

**Fala-chave (A):** "Bom dia. Nosso trabalho avalia tecnicamente uma arquitetura
web moderna — e vamos mostrar como, e o que encontramos."

---

## Slide 2 — O problema (A · 1:00)

**Mostrar:** diagrama simples — de um lado "arquitetura tradicional (servidor de
aplicação)", do outro "BaaS/Serverless (regras no banco: RLS, triggers)".

**Falas-chave (A):**
- Aplicações web modernas cada vez mais usam **BaaS/Serverless**: em vez de um
  servidor de aplicação próprio, a segurança e as regras de negócio vão para o
  **banco de dados** — políticas de acesso (RLS), *triggers*, restrições.
- Isso reduz esforço, **mas desloca atributos críticos** — segurança, confiabilidade
  — para configuração declarativa. E aí surge a pergunta do trabalho:
- **"Como validar tecnicamente se uma arquitetura BaaS realmente atende aos
  atributos de qualidade esperados?"** Os métodos clássicos assumem um servidor que
  aqui não existe.

---

## Slide 3 — Objeto vs. instrumento (A · 1:00) — *responde a dúvida de escopo*

**Mostrar:** duas caixas — **OBJETO DE PESQUISA: a avaliação** | **INSTRUMENTO: o
Hubservi (desenvolvido 100% por nós)**. Uma seta: "avaliar RLS exige acesso ao
código e ao banco → só possível num sistema próprio".

**Falas-chave (A):**
- É importante deixar claro o escopo: **o que este TCC entrega não é o sistema — é a
  avaliação.** O objeto de pesquisa é o *método de avaliar*.
- **Mas por que desenvolvemos um sistema inteiro, então?** Porque avaliar políticas
  de segurança no banco, *triggers* e a fronteira com o serviço gerenciado **exige
  acesso irrestrito ao código, ao esquema e ao ambiente** — algo impossível sobre uma
  plataforma de terceiros. O Hubservi é o **laboratório** que torna a avaliação
  possível.
- Em uma frase: **o sistema é o instrumento; a avaliação é o resultado.**

> *(Este slide existe justamente porque o orientador apontou que o escopo precisava
> ficar explícito. É a resposta.)*

---

## Slide 4 — O sistema Hubservi (A · 1:15)

**Mostrar:** 1 print da aplicação + diagrama de arquitetura enxuto (React SPA →
Supabase: Auth, PostgreSQL com RLS). Os 4 fluxos como ícones: **autenticação →
serviço → contratação → avaliação**.

**Falas-chave (A):**
- O Hubservi é um **marketplace de serviços** que conecta clientes e prestadores.
  Stack: **React + TypeScript no cliente, Supabase (PostgreSQL) como BaaS**, sem
  servidor de aplicação próprio — o caso representativo de SPA + BaaS + Serverless.
- Quatro fluxos críticos que concentram as regras de negócio: cadastro/login, criar e
  buscar serviços, contratar (*booking*) e avaliar (*review*).
- **É sobre esses fluxos que os testes de avaliação incidem.** (Não é uma vitrine de
  funcionalidades — é o que precisávamos ter para poder medir.)

> *Se houver demo ao vivo: 20 s no máximo, mostrando login → contratar → avaliar.
> Se não, o print basta. Não gastar mais que o previsto aqui.*

---

## Slide 5 — O método de avaliação (A · 1:00)

**Mostrar:** a cadeia **Atributo → Cenário → Métrica → Critério → Ferramenta** e, ao
lado, o ciclo **Medir → Detectar → Corrigir → Re-medir**. Rodapé: "ISO/IEC 25010 —
4 atributos: Segurança, Desempenho, Testabilidade/Manutenibilidade, Confiabilidade".

**Falas-chave (A):**
- Para cada atributo de qualidade da norma **ISO/IEC 25010**, definimos cenários,
  métricas, critérios de aceitação e a ferramenta que mede — de forma reprodutível.
- E adotamos uma disciplina: **medir, detectar o problema, corrigir, e medir de novo.**
  Guardamos evidência de cada estado. **Nenhum número entra no trabalho sem um arquivo
  de evidência** — é uma regra anti-fabricação.
- **Handoff:** "Agora o(a) [nome do B] vai apresentar o que essas medições revelaram."

---

## → HANDOFF (4:30) — B assume

---

## Slide 6 — Achado transversal: reprodutibilidade (B · 1:00)

**Mostrar:** título "O sistema não se reconstruía sozinho". Um `permission denied`
estilizado.

**Falas-chave (B):**
- Antes de medir segurança, montamos um ambiente reprodutível: reconstruir o banco do
  zero, só com o histórico de versão. **E o sistema não funcionou** — tudo dava
  "permissão negada".
- A causa: **as permissões de acesso à API nunca estiveram no controle de versão** —
  em produção foram aplicadas à mão. Corrigimos com uma migração que torna o histórico
  auto-suficiente.
- **Por que isso é um resultado, e não um contratempo:** é exatamente a fragilidade
  que o paradigma BaaS introduz — parte da configuração vive no serviço gerenciado e
  escapa do versionamento. **Só uma avaliação reprodutível expõe isso.**

---

## Slide 7 — Segurança: o núcleo (B · 1:30) — *o slide mais forte*

**Mostrar:** os dois furos, lado a lado, cada um com **ANTES (vermelho) → DEPOIS
(verde)**.

**Falas-chave (B):**
- A segurança é o coração de uma arquitetura BaaS: no BaaS, **o banco é a API**.
  Testamos como um atacante faria — autenticados como cada tipo de usuário.
- **Achamos dois furos reais**, que a inspeção visual não pegou:
  1. **Dados pessoais expostos:** qualquer usuário logado conseguia ler **e-mail e
     telefone de todos os outros**. Uma regra de acesso ampla demais.
  2. **Avaliação no nome errado:** um cliente conseguia publicar uma avaliação
     atribuída a **um prestador que nunca lhe atendeu** — faltava uma validação que já
     existia para os agendamentos, mas esqueceram de replicar nas avaliações.
- **Corrigimos os dois e provamos a correção.** Depois disso, todos os cenários de
  autorização passam: 0 acessos indevidos.
- **Frase de defesa:** "Não construímos testes para confirmar que o sistema estava
  bom — construímos para descobrir onde estava ruim. O valor está em ter, primeiro, a
  tela vermelha."

---

## Slide 8 — Confiabilidade + Testabilidade (B · 1:00)

**Mostrar:** duas colunas. Confiabilidade: "máquina de estados ✓, integridade ✓,
fluxo ponta a ponta ✓". Testabilidade: gráfico simples **18% → 32%**, com barra dos
módulos críticos em **82–100%**.

**Falas-chave (B):**
- **Confiabilidade — atende:** o sistema recusa transições inválidas de um pedido, não
  deixa registros órfãos ao excluir, e o fluxo completo (login → contratar → concluir
  → avaliar) funciona de ponta a ponta.
- **Testabilidade:** ampliamos a suíte e a cobertura foi de **18% para 32%**. Mas o
  essencial não é a média — é que **os módulos que decidem quem acessa o quê estão
  acima de 80%**, com uma **trava automática** que impede regressão.

---

## Slide 9 — Desempenho + Manutenibilidade (B · 1:15)

**Mostrar:** Desempenho — "API 253 ms ✓ | Página 3,2 s ✗". Manutenibilidade —
"0 dependências circulares ✓ | duplicação nos 2 painéis ✗".

**Falas-chave (B):**
- **Desempenho — medimos os dois lados.** A **API responde em 253 ms** sob carga (com
  folga). Mas a **página leva ~3,2 segundos para abrir** — abaixo da meta, mesmo
  depois de otimizarmos o empacotamento. **A leitura conjunta é o achado:** o gargalo
  está no **frontend**, não no backend. Sem medir os dois, culparíamos o lado errado.
- **Manutenibilidade — diagnóstico, não nota.** A arquitetura é sólida: **zero
  dependências circulares**, confirmado por duas ferramentas. Já a higiene do código
  está abaixo do ideal, e apontamos exatamente onde: **duas telas de painel que se
  repetem em 61 linhas.**

---

## Slide 10 — Contribuição e conclusão (B · 0:40)

**Mostrar:** "Contribuição: um **procedimento reprodutível de avaliação técnica**,
transferível a outras aplicações BaaS." Abaixo: a tabela-síntese por atributo.

**Falas-chave (B):**
- A contribuição não é a plataforma — é o **método**: modelar, derivar cenários dos
  atributos, medir com evidência registrada e corrigir. **Aplicável a qualquer
  aplicação BaaS/Serverless.**
- **Conclusão honesta:** o trabalho **não** atesta que o sistema é uniformemente bom —
  achamos três defeitos reais e o desempenho de frontend não atinge a meta. **É
  justamente a capacidade de localizar deficiências com precisão que mostra o valor do
  método.** A avaliação não existe para aprovar o sistema; existe para dizer a verdade
  sobre ele.

---

## Slide 11 — Encerramento (B, com A ao lado · 0:05)

**Mostrar:** "Obrigado(a). Perguntas?" + repositório/contato.

> Os dois ficam à frente para as perguntas.

---

## Anexo — Perguntas prováveis da banca (e respostas)

Distribuir mentalmente: **A** responde escopo/método/arquitetura; **B** responde
resultados/ferramentas. Combinem antes quem pega o quê.

**"Afinal, o trabalho é o sistema ou os testes?"** (A)
> O objeto é a avaliação; o sistema é o instrumento que a torna possível. Não se
> avalia RLS de terceiros sem acesso ao código e ao banco — por isso desenvolvemos o
> Hubservi. O que é transferível, e é a contribuição, é o procedimento de avaliação.

**"Por que só 32% de cobertura? Não é pouco?"** (B)
> A média global é puxada para baixo por telas extensas de pouca lógica e por código
> de terceiros que excluímos de propósito. O que importa é que os módulos críticos —
> os que controlam acesso — estão acima de 80%, com trava anti-regressão. Preferimos
> definir e proteger o que é crítico a perseguir uma média inflada.

**"Vocês trocaram ferramentas do plano (k6, Snyk, SonarQube). Isso não enfraquece?"** (B)
> Substituímos por ferramentas da mesma classe quando as nomeadas exigiam conta ou não
> estavam disponíveis — autocannon no lugar do k6, npm audit no lugar do Snyk, sonarjs
> local no lugar do SonarQube. As métricas medidas são as mesmas, e cada troca está
> registrada na metodologia. É uma decisão documentada, não uma lacuna.

**"O desempenho não atingiu a meta. Isso é uma falha do trabalho?"** (B)
> Pelo contrário — é um resultado. Medimos, diagnosticamos a causa (o peso do
> frontend), aplicamos uma otimização, melhoramos de 85 para 88 e documentamos o que
> ainda falta. Uma avaliação séria reporta a deficiência com números; não fabrica uma
> tela verde.

**"Vocês corrigiram os furos. O sistema de produção está seguro agora?"** (B)
> As correções estão versionadas como migrações e cobertas por testes que falham se o
> furo reaparecer. Falta aplicá-las em produção e rodar a varredura dinâmica contra a
> URL publicada — está registrado como próximo passo. Além disso, há um CVE de
> produção numa dependência (biblioteca de rotas) a atualizar.

**"Como garanto que esses números são reais e reprodutíveis?"** (A)
> Cada número remete a um arquivo de evidência com ferramenta, versão, ambiente e data,
> em `docs/tcc/medicoes/`, e a um commit. Além disso, um pipeline de integração
> contínua reexecuta os testes e as travas de qualidade a cada alteração.

**"O que é RLS, exatamente?"** (A)
> *Row Level Security* — regras no próprio PostgreSQL que definem, linha a linha, quem
> pode ler ou alterar cada registro. No BaaS, é a principal camada de autorização, já
> que não há servidor de aplicação intermediando o acesso ao banco.

---

## Dicas finais

- **Ensaiar cronometrado pelo menos 2 vezes.** O maior risco em defesa é estourar o
  tempo — os slides 4 e 8 são os primeiros a enxugar.
- **Handoff único e limpo** (fim do slide 5). Evitem trocar de voz toda hora — cansa e
  parece desorganizado.
- **Números decorados:** 18%→32%, p95 253 ms, LCP 3,2 s, 2 furos, 0 ciclos. Se
  errarem um número, não travem — o valor está na narrativa.
- **A tela vermelha é a estrela.** O que diferencia este trabalho é ter *encontrado e
  provado* defeitos reais. Contem isso com convicção.
