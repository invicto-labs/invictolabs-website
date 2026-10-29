param(
  [string]$OutputDirectory = 'production-dist-generated',
  [string]$Version = 'production'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputRoot = Join-Path $projectRoot $OutputDirectory
$assetsRoot = Join-Path $outputRoot 'assets'
$esbuild = Join-Path $projectRoot 'node_modules\@esbuild\win32-x64\esbuild.exe'

if (Test-Path -LiteralPath $outputRoot) {
  throw "Output directory already exists: $outputRoot"
}

New-Item -ItemType Directory -Path $assetsRoot -Force | Out-Null

& $esbuild (Join-Path $projectRoot 'src\main.tsx') `
  --bundle `
  --splitting `
  --format=esm `
  --platform=browser `
  --target=es2020 `
  --jsx=automatic `
  "--outdir=$assetsRoot" `
  --entry-names=app `
  "--chunk-names=chunks/[name]-[hash]" `
  "--asset-names=assets/[name]-[hash]" `
  --minify

if ($LASTEXITCODE -ne 0) {
  throw "The production bundle failed with exit code $LASTEXITCODE."
}

Copy-Item -Path (Join-Path $projectRoot 'public\*') -Destination $outputRoot -Recurse -Force
Copy-Item -LiteralPath (Join-Path $projectRoot 'vercel.json') -Destination $outputRoot

function Write-AppDocument {
  param([string]$Source, [string]$Destination)

  $destinationFolder = Split-Path -Parent $Destination
  New-Item -ItemType Directory -Path $destinationFolder -Force | Out-Null
  $html = [System.IO.File]::ReadAllText($Source)
  $html = $html.Replace(
    '<script type="module" src="/src/main.tsx"></script>',
    "<script type=`"module`" src=`"/assets/app.js?v=$Version`"></script>"
  )
  $stylesheet = "    <link rel=`"stylesheet`" href=`"/assets/app.css?v=$Version`" />`r`n"
  $html = $html.Replace('  </head>', "$stylesheet  </head>")
  [System.IO.File]::WriteAllText($Destination, $html, [System.Text.UTF8Encoding]::new($false))
}

$appDocuments = @(
  @{ Source = 'index.html'; Destination = 'index.html' },
  @{ Source = '404.html'; Destination = '404.html' },
  @{ Source = 'our-company\index.html'; Destination = 'our-company\index.html' },
  @{ Source = 'faq\index.html'; Destination = 'faq\index.html' },
  @{ Source = 'products\index.html'; Destination = 'products\index.html' }
)

foreach ($document in $appDocuments) {
  Write-AppDocument `
    -Source (Join-Path $projectRoot $document.Source) `
    -Destination (Join-Path $outputRoot $document.Destination)
}

$redirectDocuments = @(
  'about.html',
  'faq.html',
  'home\index.html',
  'homepage\index.html',
  'company\index.html',
  'ourcompany\index.html',
  'product\index.html'
)

foreach ($document in $redirectDocuments) {
  $destination = Join-Path $outputRoot $document
  New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
  Copy-Item -LiteralPath (Join-Path $projectRoot $document) -Destination $destination
}

Write-Output "Production bundle created at $outputRoot"
