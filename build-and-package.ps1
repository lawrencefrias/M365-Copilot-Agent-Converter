<#
.SYNOPSIS
Builds the M365 Copilot Agent Converter, converts an exported M365 Copilot agent ZIP, and packages the output for Copilot Studio import.

.DESCRIPTION
- Prompts the user for the original exported .zip file from M365 Copilot.
- Builds the TypeScript project (outputs to ./dist).
- Runs the converter CLI with the provided input file.
- Compresses the converted output into a .zip file ready for Copilot Studio.

.NOTES
Author: Lawrence's Copilot Assistant
#>

# Prompt for input file
$inputZip = Read-Host "Enter the full path to the exported M365 Copilot .zip file"
if (-Not (Test-Path $inputZip)) {
    Write-Host "❌ File not found: $inputZip" -ForegroundColor Red
    exit 1
}

# Define paths
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$outDir = Join-Path $repoRoot "out"
$packageZip = Join-Path $repoRoot "copilot-agent.zip"

Write-Host "✅ Starting build and packaging process..." -ForegroundColor Cyan

# Step 1: Build the project
Write-Host "`n[1/3] Building TypeScript project..." -ForegroundColor Yellow
npx tsc --outDir dist
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Check errors above." -ForegroundColor Red
    exit 1
}

# Step 2: Run the converter
Write-Host "`n[2/3] Running converter..." -ForegroundColor Yellow
if (Test-Path $outDir) { Remove-Item $outDir -Recurse -Force }
node .\bin\m3652cs.js -i $inputZip -o $outDir
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Conversion failed. Check errors above." -ForegroundColor Red
    exit 1
}

# Step 3: Package the output
Write-Host "`n[3/3] Creating ZIP package for Copilot Studio..." -ForegroundColor Yellow
if (Test-Path $packageZip) { Remove-Item $packageZip -Force }
Compress-Archive -Path "$outDir\*" -DestinationPath $packageZip -Force

Write-Host "`n✅ Done! Your Copilot Studio import package is ready:" -ForegroundColor Green
Write-Host $packageZip -ForegroundColor Cyan
