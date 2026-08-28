<#
.SYNOPSIS
    Converte os .docx gerados por gerar-artigo-docx.py em PDF, usando o Word instalado.

.DESCRIPTION
    O Word é usado como conversor porque o layout ABNT (margens, estilos, legendas e
    as imagens dos diagramas) é herdado do .docx de origem: converter por outra rota
    reflowaria o documento e o PDF deixaria de corresponder ao arquivo entregue.

    Sem Word na máquina, a alternativa é abrir o .docx e usar "Salvar como PDF" em
    qualquer editor compatível — o resultado é o mesmo documento.

.EXAMPLE
    .\docs\tcc\gerar-pdf.ps1
.EXAMPLE
    .\docs\tcc\gerar-pdf.ps1 -Somente Apendice
#>
[CmdletBinding()]
param(
    [ValidateSet('Tudo', 'Artigo', 'Apendice', 'ApendiceC')]
    [string]$Somente = 'Tudo'
)

$ErrorActionPreference = 'Stop'

$raiz = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$docs = Join-Path $raiz 'docs'

# origem (.docx)  ->  destino (.pdf)
$conversoes = @(
    @{ Nome = 'Artigo'
       Origem  = Join-Path $docs 'Artigo_PedroConrado_RichardyRodrigues_ATUALIZADO.docx'
       Destino = Join-Path $docs 'Artigo_PedroConrado_RichardyRodrigues_ATUALIZADO.pdf' }
    @{ Nome = 'Apendice'
       Origem  = Join-Path $docs 'Apendice_A_Diagramas.docx'
       # Ao lado do .md: os dois são o mesmo material suplementar, em formatos diferentes.
       Destino = Join-Path $docs 'tcc\apendice-a-diagramas.pdf' }
    @{ Nome = 'ApendiceC'
       Origem  = Join-Path $docs 'Apendice_C_Evidencias.docx'
       Destino = Join-Path $docs 'tcc\apendice-c-evidencias.pdf' }
)

if ($Somente -ne 'Tudo') {
    $conversoes = @($conversoes | Where-Object { $_.Nome -eq $Somente })
}

$faltando = @($conversoes | Where-Object { -not (Test-Path $_.Origem) })
if ($faltando) {
    throw ("Origem ausente: {0}. Rode antes: python docs/tcc/gerar-artigo-docx.py" -f
           ($faltando.Origem -join ', '))
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    foreach ($c in $conversoes) {
        $doc = $word.Documents.Open([string]$c.Origem, $false, $true)  # ReadOnly
        try {
            $doc.ExportAsFixedFormat([string]$c.Destino, 17)           # 17 = wdFormatPDF
        } finally {
            $doc.Close(0)                                             # 0 = wdDoNotSaveChanges
        }
        $kb = [Math]::Round((Get-Item $c.Destino).Length / 1KB)
        Write-Host ("  {0,-9} -> {1} ({2} KB)" -f $c.Nome, $c.Destino, $kb)
    }
} finally {
    $word.Quit()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word)
}
