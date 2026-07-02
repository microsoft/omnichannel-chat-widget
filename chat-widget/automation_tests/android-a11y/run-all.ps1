# Requires: booted Android emulator (adb device online), Node, Java, and this
# folder's dependencies installed (npm install; npx appium driver install uiautomator2).
# Orchestrates: build the util bundle from source, start the static server, start
# Appium, run the accessibility-tree check, then tear everything down. Exit code
# is the test result (0 = GREEN, 1 = RED / harness error).
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

$sdk = "$env:LOCALAPPDATA\Android\Sdk"
$adb = Join-Path $sdk "platform-tools\adb.exe"

Write-Host "== Checking emulator ==" -ForegroundColor Cyan
$boot = & $adb shell getprop sys.boot_completed 2>$null
if ("$boot".Trim() -ne "1") {
    throw "No booted emulator found (sys.boot_completed != 1). Start one with: emulator -avd <name>"
}

Write-Host "== Building util bundle from source ==" -ForegroundColor Cyan
node build-util.js

$server = $null
$appium = $null
try {
    Write-Host "== Starting static server ==" -ForegroundColor Cyan
    $server = Start-Process node -ArgumentList "static-server.js" -PassThru -NoNewWindow

    Write-Host "== Starting Appium ==" -ForegroundColor Cyan
    $appium = Start-Process npx -ArgumentList "appium", "--log-level", "error" -PassThru -NoNewWindow
    Start-Sleep -Seconds 6

    Write-Host "== Running focus-escape accessibility-tree check ==" -ForegroundColor Cyan
    node run-focus-escape.js
    $code = $LASTEXITCODE
    Write-Host "== Exit code: $code ==" -ForegroundColor Cyan
    exit $code
}
finally {
    if ($server) { Stop-Process -Id $server.Id -ErrorAction SilentlyContinue }
    if ($appium) { Stop-Process -Id $appium.Id -ErrorAction SilentlyContinue }
}
