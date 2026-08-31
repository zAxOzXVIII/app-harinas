# Preparacion rapida: deps, .env y chequeo Render antes de conectar COM3
$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent

Write-Host "=== App Harinas - prep COM3 ===" -ForegroundColor Cyan

function Ensure-Env($example, $target) {
  if (-not (Test-Path $target)) {
    Copy-Item $example $target
    Write-Host "Creado $target desde ejemplo"
  }
}

$gw = Join-Path $Root "firmware\arduino-uno-aht10-ds3231-hc05\gateway"
Ensure-Env (Join-Path $gw ".env.example") (Join-Path $gw ".env")
Ensure-Env (Join-Path $Root "frontend\.env.example") (Join-Path $Root "frontend\.env")

Write-Host ""
Write-Host "--- Instalando dependencias gateway ---"
Push-Location $gw
npm install --silent
Pop-Location

Write-Host ""
Write-Host "--- Puertos COM ---"
Push-Location $gw
npm run ports --silent
Pop-Location

Write-Host ""
Write-Host "--- Render health ---"
try {
  $r = Invoke-WebRequest -Uri "https://app-harinas.onrender.com/api/health" -UseBasicParsing -TimeoutSec 45
  Write-Host ("OK " + $r.StatusCode + " " + $r.Content)
} catch {
  Write-Host "Render no respondio. El gateway lo despertara al arrancar." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "--- Listo ---"
Write-Host "1. Conecta Arduino Uno por USB - COM3 o edita gateway/.env"
Write-Host "2. Cierra Monitor Serie de Arduino IDE"
Write-Host "3. cd firmware\arduino-uno-aht10-ds3231-hc05\gateway"
Write-Host "4. npm run probe   # prueba 15s"
Write-Host "5. npm start       # envia a Render"
Write-Host "6. App usa EXPO_PUBLIC_API_URL=https://app-harinas.onrender.com"
