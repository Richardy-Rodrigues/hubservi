<#
.SYNOPSIS
    Reencena na tela as saídas de ferramenta preservadas em docs/tcc/medicoes/evidencias/,
    para captura de tela (print) sem re-executar nenhuma medição.

.DESCRIPTION
    Cada tela recebe um cabeçalho que identifica a medição, a data da coleta, o commit e o
    comando original — de modo que a imagem capturada se declare como evidência preservada,
    e não como uma execução ao vivo.

    Os logs mantêm as sequências ANSI originais do Vitest (vermelho/verde), por isso a saída
    é escrita com [Console]::Write, sem passar pelo pipeline do PowerShell.

    Requer Windows Terminal (processamento VT ligado por padrão).

.EXAMPLE
    .\replay-evidencia.ps1 -List
.EXAMPLE
    .\replay-evidencia.ps1 -Id P-11
.EXAMPLE
    .\replay-evidencia.ps1 -All
#>
[CmdletBinding()]
param(
    [string]$Id,
    [switch]$All,
    [switch]$List,
    [switch]$NoPause,
    [switch]$NoHtml
)

$ErrorActionPreference = 'Stop'

# --- contexto -----------------------------------------------------------------
$medicoesDir = Split-Path -Parent $PSScriptRoot
$evidDir     = Join-Path $medicoesDir 'evidencias'
$htmlDir     = Join-Path $evidDir 'prints\_html'
$repoRoot    = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $medicoesDir))
$commit      = 'ad89e6c'

# UTF-8 no console: sem isso os travessões dos ambiente.txt saem como "â€”" na imagem.
try { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false) } catch { }

$ESC  = [char]27
$DIM  = "$ESC[90m"; $CYAN = "$ESC[96m"; $BOLD = "$ESC[1m"
$YEL  = "$ESC[93m"; $RST  = "$ESC[0m"

if (-not $env:WT_SESSION -and -not $NoPause) {
    Write-Warning 'Sem WT_SESSION: rode no Windows Terminal, senão as cores ANSI dos logs podem não renderizar.'
}

# --- definição das telas ------------------------------------------------------
# Files : arquivos de texto/log reproduzidos literalmente
# Json  : @{ Path = ...; Node = 'total' } — imprime o nó indicado do JSON
# Html  : relatório gerado por gerar-relatorios-html.mjs, aberto no navegador
$telas = @(
    @{ Id='P-01'; Medicao='Contexto de reprodutibilidade'; Data='2026-07-15 e 2026-07-16'; Rotulo='coleta de'
       Comando='git rev-parse HEAD, node -v, npm -v, supabase --version'
       Files=@('2026-07-15\ambiente.txt','2026-07-16\ambiente.txt') }

    @{ Id='P-02'; Medicao='M-01 — suíte unitária (Vitest)'; Data='2026-07-15'
       Comando='npm test'
       Files=@('2026-07-15\vitest-unit.log') }

    @{ Id='P-03'; Medicao='M-01b — cobertura de testes (Semana 5)'; Data='2026-07-16'
       Comando='npm run test:coverage'
       Files=@('2026-07-16\coverage-semana5.txt')
       Json=@{ Path='2026-07-16\coverage-summary-semana5.json'; Node='total' } }

    @{ Id='P-04'; Medicao='M-02 — violações de lint (configuração do projeto)'; Data='2026-07-15'
       Comando='npx eslint . -f json -o evidencias/2026-07-15/eslint-report.json'
       Html='eslint-M02.html' }

    @{ Id='P-05'; Medicao='M-21 — code smells (ESLint + sonarjs)'; Data='2026-07-16'
       Comando='npm run measure:smells'
       Html='eslint-sonarjs-M21.html' }

    @{ Id='P-06'; Medicao='M-03 — dependências circulares (Madge)'; Data='2026-07-15'
       Comando='npx madge --circular --extensions ts,tsx src/'
       Files=@('2026-07-15\madge-circular.txt')
       Leitura='0 ciclos: o madge lista uma dependência circular por linha quando existe; a saída não lista nenhuma.' }

    @{ Id='P-07'; Medicao='M-22 — duplicação de código (jscpd)'; Data='2026-07-16'
       Comando='npm run measure:dup'
       Json=@{ Path='2026-07-16\jscpd\jscpd-report.json'; Node='statistics.total' } }

    @{ Id='P-08'; Medicao='M-23/M-24 — acoplamento e instabilidade (dependency-cruiser)'; Data='2026-07-16'
       Comando='npx depcruise src --output-type metrics'
       Files=@('2026-07-16\depcruise-metrics.txt')
       Cabecalho='(type\s+name\s+N\s+Ca|^-------)'
       Filtro='^(folder|module)\s+src'
       Excluir='__tests__|src/components/ui/|src/test/'
       Recorte='módulos e pastas de src/, exceto testes e o shadcn vendorizado (components/ui)'
       MaxLinhas=30
       Leitura='I(%) = instabilidade = Ce/(Ca+Ce). Folhas (pages, dashboards) próximas de 100%; núcleo (lib, contexts, integrations) com valores baixos — o padrão esperado pelo princípio das dependências estáveis.' }

    @{ Id='P-09'; Medicao='M-04/M-05 — stack local reproduzido + smoke de integração'; Data='2026-07-16'
       Comando='npm run db:reset && npm run test:integration'
       Files=@('2026-07-16\ambiente.txt','2026-07-16\vitest-integration.log') }

    @{ Id='P-10'; Medicao='M-05..M-13 — suíte completa de integração (RLS e triggers)'; Data='2026-07-16'
       Comando='npm run test:integration'
       Files=@('2026-07-16\suite-integracao-completa.log') }

    @{ Id='P-11'; Medicao='F-02/F-03 — ANTES da correção (o instrumento reprova o sistema)'; Data='2026-07-16'
       Comando='npm run test:integration  (antes das migrations 20260716130000 e 20260716130100)'
       Files=@('2026-07-16\rls-furos-ANTES.log') }

    @{ Id='P-12'; Medicao='F-02/F-03 — DEPOIS da correção (mesmos testes)'; Data='2026-07-16'
       Comando='npm run test:integration  (após as migrations de correção)'
       Files=@('2026-07-16\rls-furos-DEPOIS.log') }

    @{ Id='P-13'; Medicao='F-01 — privilégios de API sobre public.profiles'; Data='2026-07-16'
       Comando='psql: SELECT grantee, string_agg(privilege_type, '','') FROM information_schema.role_table_grants WHERE table_name = ''profiles'''
       Files=@('2026-07-16\grants-profiles-depois.txt') }

    @{ Id='P-14'; Medicao='M-14..M-17 — Lighthouse, execução mediana (antes do code-split)'; Data='2026-07-16'
       Comando='vite build && vite preview && lighthouse http://localhost:4173/ --only-categories=performance'
       Files=@('2026-07-16\lighthouse-resumo.txt')
       Html='lighthouse-M14-antes.html' }

    @{ Id='P-15'; Medicao='M-14..M-17 — Lighthouse, execução mediana (depois do code-split)'; Data='2026-07-16'
       Comando='vite build && vite preview && lighthouse http://localhost:4173/ --only-categories=performance'
       Files=@('2026-07-16\lighthouse-split-resumo.txt')
       Html='lighthouse-M14-depois.html' }

    @{ Id='P-16'; Medicao='M-18..M-20 — carga sobre a listagem de serviços (autocannon)'; Data='2026-07-16'
       Comando='npm run load:seed && npm run load:smoke && npm run load:run'
       Json=@(@{ Path='2026-07-16\autocannon-smoke.json'; Node='' },
              @{ Path='2026-07-16\autocannon-load.json';  Node='' }) }

    @{ Id='P-17'; Medicao='M-25 — vulnerabilidades em dependências (npm audit)'; Data='2026-07-16'
       Comando='npm audit --json'
       Json=@{ Path='2026-07-16\npm-audit.json'; Node='metadata' } }

    @{ Id='P-18'; Medicao='M-26 — integridade do schema'; Data='2026-07-16'
       Comando='supabase db lint'
       Files=@('2026-07-16\supabase-db-lint.txt') }
)

# --- helpers ------------------------------------------------------------------
function Get-No($obj, $caminho) {
    if ([string]::IsNullOrWhiteSpace($caminho)) { return $obj }
    $atual = $obj
    foreach ($parte in $caminho.Split('.')) { $atual = $atual.$parte }
    return $atual
}

function Write-Cabecalho($tela) {
    $linha = ('─' * 77)
    $rotulo = 'execução de'
    if ($tela.Rotulo) { $rotulo = $tela.Rotulo }
    [Console]::Write("$CYAN┌$linha$RST`n")
    [Console]::Write("$CYAN│$RST $BOLD$($tela.Id)$RST · $($tela.Medicao)`n")
    [Console]::Write("$CYAN│$RST $rotulo $($tela.Data) · commit $commit`n")
    [Console]::Write("$CYAN│$RST comando: $DIM$($tela.Comando)$RST`n")
    [Console]::Write("$CYAN└$linha$RST`n")
}

function Write-Fonte($rel) {
    [Console]::Write("`n$DIM  fonte: docs/tcc/medicoes/evidencias/$($rel -replace '\\','/')$RST`n`n")
}

function Show-Arquivo($tela, $rel) {
    $full = Join-Path $evidDir $rel
    if (-not (Test-Path $full)) { throw "Evidência ausente: $full" }
    Write-Fonte $rel
    $raw = [IO.File]::ReadAllText($full, [Text.Encoding]::UTF8)

    if ($tela.Filtro) {
        $todas  = @($raw -split "`r?`n")
        $linhas = @($todas | Where-Object { $_ -match $tela.Filtro })
        if ($tela.Excluir) { $linhas = @($linhas | Where-Object { $_ -notmatch $tela.Excluir }) }
        $total  = $linhas.Count
        $limite = 30
        if ($tela.MaxLinhas) { $limite = $tela.MaxLinhas }

        [Console]::Write("$YEL  [recorte da evidência: $($tela.Recorte) — $total de $($todas.Count) linhas]$RST`n`n")
        foreach ($l in @($todas | Where-Object { $_ -match $tela.Cabecalho })) { [Console]::Write("$l`n") }

        if ($total -le $limite) {
            foreach ($l in $linhas) { [Console]::Write("$l`n") }
        } else {
            # As linhas vêm ordenadas por instabilidade decrescente: mostrar o topo
            # (folhas voláteis) e o fim (núcleo estável) é o que sustenta a leitura do M-24.
            $topo = [Math]::Ceiling($limite / 2)
            $fim  = $limite - $topo
            foreach ($l in ($linhas | Select-Object -First $topo)) { [Console]::Write("$l`n") }
            [Console]::Write("$YEL  [... $($total - $limite) linhas intermediárias omitidas para caber na tela ...]$RST`n")
            foreach ($l in ($linhas | Select-Object -Last $fim)) { [Console]::Write("$l`n") }
        }
    } else {
        [Console]::Write($raw)
        if (-not $raw.EndsWith("`n")) { [Console]::Write("`n") }
    }
}

function Show-Json($rel, $node) {
    $full = Join-Path $evidDir $rel
    if (-not (Test-Path $full)) { throw "Evidência ausente: $full" }
    Write-Fonte $rel
    $dados = Get-Content $full -Raw | ConvertFrom-Json
    if ($node) { [Console]::Write("$DIM  campo extraído: .$node$RST`n`n") }
    $recorte = Get-No $dados $node
    [Console]::Write((($recorte | ConvertTo-Json -Depth 6) + "`n"))
    return $recorte
}

function Write-Leitura($texto) {
    [Console]::Write("`n$BOLD  LEITURA:$RST $texto`n")
}

function Show-Tela($tela) {
    Clear-Host
    Write-Cabecalho $tela

    if ($tela.Files)   { foreach ($f in $tela.Files) { Show-Arquivo $tela $f } }

    if ($tela.Json) {
        foreach ($j in @($tela.Json)) {
            $recorte = Show-Json $j.Path $j.Node
            switch -Wildcard ($j.Path) {
                '*coverage-summary*' { Write-Leitura ("linhas {0}% ({1}/{2})  ·  ramos {3}%  ·  funções {4}%" -f $recorte.lines.pct, $recorte.lines.covered, $recorte.lines.total, $recorte.branches.pct, $recorte.functions.pct) }
                '*jscpd*'            { Write-Leitura ("{0}% de linhas duplicadas — {1} clones, {2} de {3} linhas, em {4} arquivos" -f $recorte.percentage, $recorte.clones, $recorte.duplicatedLines, $recorte.lines, $recorte.sources) }
                '*npm-audit*'        { Write-Leitura ("{0} altas · {1} moderadas · {2} críticas, em {3} dependências" -f $recorte.vulnerabilities.high, $recorte.vulnerabilities.moderate, $recorte.vulnerabilities.critical, $recorte.dependencies.total) }
                '*autocannon-load*'  { Write-Leitura ("{0} requisições em {1}s · {2} req/s · p95 {3} ms · {4} erros / {5} non-2xx" -f $recorte.requests_total, $recorte.duration_s, $recorte.rps_mean, $recorte.latency_p95_ms, $recorte.errors, $recorte.non2xx) }
            }
        }
    }

    if ($tela.Leitura) { Write-Leitura $tela.Leitura }

    if ($tela.Html) {
        $htmlPath = Join-Path $htmlDir $tela.Html
        if (Test-Path $htmlPath) {
            [Console]::Write("`n$BOLD  Relatório nativo da ferramenta:$RST $htmlPath`n")
            if (-not $NoHtml) {
                [Console]::Write("$DIM  abrindo no navegador — capture a página, não este terminal.$RST`n")
                Start-Process $htmlPath
            }
        } else {
            [Console]::Write("`n$YEL  Relatório ainda não gerado. Rode primeiro:$RST`n")
            [Console]::Write("    node docs/tcc/medicoes/scripts/gerar-relatorios-html.mjs`n")
        }
    }

    [Console]::Write("`n$DIM  [$($tela.Id)] capture agora com Win+Shift+S e salve como $($tela.Id)-*.png em evidencias/prints/$RST`n")
}

# --- execução -----------------------------------------------------------------
if ($List -or (-not $Id -and -not $All)) {
    Write-Host ''
    Write-Host 'Telas disponíveis (docs/tcc/medicoes/evidencias/prints/README.md descreve cada uma):' -ForegroundColor Cyan
    Write-Host ''
    foreach ($t in $telas) { '  {0}  {1}' -f $t.Id, $t.Medicao | Write-Host }
    Write-Host ''
    Write-Host '  -Id P-11    uma tela      |    -All    todas, com pausa entre elas' -ForegroundColor DarkGray
    Write-Host ''
    return
}

$selecao = @($telas)
if ($Id) {
    $selecao = @($telas | Where-Object { $_.Id -eq $Id.ToUpper() })
    if (-not $selecao) { throw "Tela desconhecida: $Id. Use -List para ver os IDs." }
}

foreach ($t in $selecao) {
    Show-Tela $t
    if ($All -and -not $NoPause -and $t.Id -ne $selecao[-1].Id) {
        [Console]::Write("`n$DIM  Enter para a próxima tela...$RST")
        [void][Console]::ReadLine()
    }
}
