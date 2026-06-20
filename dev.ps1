# Start Warehouse Scan for local development (Windows).
# Opens the API in a new window, then starts the Next.js UI in this window.
$ErrorActionPreference = "Stop"
$ScanRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScanRoot

if (-not (Test-Path "$ScanRoot\node_modules")) {
  Write-Host "==> Installing dependencies..."
  pnpm install
}

Write-Host "==> Starting Scan API on http://127.0.0.1:5003 (new window)"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$ScanRoot\backend'; Write-Host 'Scan API — keep this window open'; python run.py"
)

Write-Host "==> Starting Scan UI on http://127.0.0.1:5002"
Write-Host "    Sign in: admin / admin1234"
Write-Host ""
pnpm dev
