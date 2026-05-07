# Bootstrap NVDA on a Windows CI runner.
#
# Idempotent install of NVDA at a pinned version so screen-reader specs run
# under @guidepup/guidepup against the same speech cadence locally and in CI.
# The pinned version must match tools/accessibility/nvda-phrases.json _meta.nvdaVersion.
#
# Usage (CI, from repo root):
#   pwsh -File tools/accessibility/setupNvda.ps1
#
# Local dev: see docs/accessibility/NVDA_SETUP.md for the manual install path.

[CmdletBinding()]
param(
    [string]$Version = "2024.4",
    [string]$DownloadUrl = "https://www.nvaccess.org/download/nvda/releases/2024.4/nvda_2024.4.exe",
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$installerDir = Join-Path $env:TEMP "nvda-installer"
$installerPath = Join-Path $installerDir "nvda_$Version.exe"
$installRoot = "C:\\Program Files (x86)\\NVDA"
$nvdaExe = Join-Path $installRoot "nvda.exe"

if ((Test-Path $nvdaExe) -and -not $Force) {
    Write-Host "NVDA already installed at $nvdaExe; skipping. Pass -Force to re-install."
    & $nvdaExe --version 2>$null
    exit 0
}

if (-not (Test-Path $installerDir)) {
    New-Item -ItemType Directory -Path $installerDir | Out-Null
}

Write-Host "Downloading NVDA $Version from $DownloadUrl ..."
Invoke-WebRequest -Uri $DownloadUrl -OutFile $installerPath -UseBasicParsing

Write-Host "Installing NVDA silently ..."
# NVDA's silent install switches: --install --silent.
$proc = Start-Process -FilePath $installerPath -ArgumentList "--install","--silent" -Wait -PassThru
if ($proc.ExitCode -ne 0) {
    throw "NVDA installer exited with code $($proc.ExitCode)."
}

if (-not (Test-Path $nvdaExe)) {
    throw "NVDA install completed but $nvdaExe is not present."
}

Write-Host "NVDA installed at $nvdaExe."
& $nvdaExe --version 2>$null

# Pin verbosity / synth so spec phrase assertions are stable. Guidepup's
# default config can override these, but writing them here gives a clean
# baseline on a fresh runner.
$nvdaConfigDir = Join-Path $env:APPDATA "nvda"
if (-not (Test-Path $nvdaConfigDir)) {
    New-Item -ItemType Directory -Path $nvdaConfigDir | Out-Null
}

Write-Host "NVDA bootstrap complete."
