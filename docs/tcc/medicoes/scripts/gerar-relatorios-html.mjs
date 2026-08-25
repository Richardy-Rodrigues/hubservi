/**
 * Gera os relatórios HTML nativos das ferramentas a partir dos JSONs de evidência
 * já preservados em docs/tcc/medicoes/evidencias/ — sem re-executar nenhuma medição.
 *
 *   ESLint      : o *-report.json salvo já é o array `results` da API do ESLint,
 *                 então o formatter `html` oficial o renderiza tal como no dia da coleta.
 *   Lighthouse  : os arquivos lighthouse-*.json são LHR completos; o ReportGenerator
 *                 da própria versão 12.8.2 (a registrada em `lighthouseVersion`)
 *                 reconstrói o relatório idêntico ao daquela execução.
 *
 * Uso:  node docs/tcc/medicoes/scripts/gerar-relatorios-html.mjs
 * Saída: docs/tcc/medicoes/evidencias/prints/_html/  (derivado, fora do versionamento)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const evidDir = resolve(scriptDir, '..', 'evidencias')
const outDir = join(evidDir, 'prints', '_html')

mkdirSync(outDir, { recursive: true })

const lerJson = (rel) => JSON.parse(readFileSync(join(evidDir, rel), 'utf8'))
const gravar = (nome, html) => {
  const destino = join(outDir, nome)
  writeFileSync(destino, html, 'utf8')
  console.log(`  ok  ${nome}  (${(html.length / 1024).toFixed(0)} KB)`)
}

// --- ESLint: M-02 (config do projeto) e M-21 (config de medição, com sonarjs) ---
const relatoriosEslint = [
  { origem: '2026-07-15/eslint-report.json', saida: 'eslint-M02.html', coleta: '2026-07-15', medicao: 'M-02' },
  { origem: '2026-07-16/eslint-sonarjs-report.json', saida: 'eslint-sonarjs-M21.html', coleta: '2026-07-16', medicao: 'M-21' },
]

console.log('ESLint — formatter html oficial sobre os results preservados')
const require_ = createRequire(import.meta.url)

// `ESLint#loadFormatter` recusa results que não venham da própria instância
// ("Results object was not created from this ESLint instance"), então o módulo do
// formatter oficial é carregado direto do pacote — é o mesmo código que `-f html` usa.
const eslintDir = dirname(require_.resolve('eslint/package.json'))
const formatarHtml = require_(join(eslintDir, 'lib', 'cli-engine', 'formatters', 'html.js'))

// Metadados das regras: só os links de documentação das regras core; as de plugin
// (sonarjs, @typescript-eslint) ficam sem link — o formatter trata a ausência.
const { builtinRules } = await import('eslint/use-at-your-own-risk')
const rulesMeta = {}
for (const [ruleId, rule] of builtinRules) rulesMeta[ruleId] = rule.meta

for (const { origem, saida, coleta, medicao } of relatoriosEslint) {
  const results = lerJson(origem)
  const totais = results.reduce(
    (acc, r) => ({ erros: acc.erros + r.errorCount, avisos: acc.avisos + r.warningCount }),
    { erros: 0, avisos: 0 },
  )
  // O formatter carimba a data de geração do HTML; trocá-la pela data da execução
  // evita que a imagem capturada indique uma data que não é a da medição.
  const html = formatarHtml(results, { rulesMeta }).replace(
    /- Generated on [^<]*/,
    `— ${medicao} · execução de ${coleta} · commit ad89e6c · ` +
      `relatório gerado de ${origem.split('/').pop()}`,
  )
  gravar(saida, html)
  console.log(`      ${origem} → ${totais.erros} erros, ${totais.avisos} avisos`)
}

// --- Lighthouse: as execuções medianas, antes e depois do code-splitting ---
// Medianas conforme lighthouse-resumo.txt (run 3: score 85) e
// lighthouse-split-resumo.txt (run 2: score 88).
const relatoriosLh = [
  { origem: '2026-07-16/lighthouse-3.json', saida: 'lighthouse-M14-antes.html' },
  { origem: '2026-07-16/lighthouse-split-2.json', saida: 'lighthouse-M14-depois.html' },
]

console.log('\nLighthouse — ReportGenerator sobre os LHR preservados')
let ReportGenerator
try {
  ;({ ReportGenerator } = await import('lighthouse/report/generator/report-generator.js'))
} catch {
  console.log('  -- pacote `lighthouse` não instalado.')
  console.log('     Opção A (offline):  npm install --no-save lighthouse@12.8.2   e rode este script de novo')
  console.log('       (--no-save de propósito: gravar a dependência mudaria o grafo que o M-25 mede)')
  console.log('     Opção B (sem instalar): abra https://googlechrome.github.io/lighthouse/viewer/')
  console.log('       e arraste os arquivos:')
  for (const { origem } of relatoriosLh) console.log(`         docs/tcc/medicoes/evidencias/${origem}`)
}

if (ReportGenerator) {
  for (const { origem, saida } of relatoriosLh) {
    const lhr = lerJson(origem)
    gravar(saida, ReportGenerator.generateReportHtml(lhr))
    const score = Math.round(lhr.categories.performance.score * 100)
    const lcp = lhr.audits['largest-contentful-paint'].displayValue
    console.log(`      ${origem} → Lighthouse ${lhr.lighthouseVersion}, score ${score}, LCP ${lcp}`)
  }
}

console.log(`\nRelatórios em ${outDir}`)
if (!existsSync(join(outDir, 'lighthouse-M14-antes.html'))) {
  console.log('Faltam os do Lighthouse — veja as opções acima.')
}
