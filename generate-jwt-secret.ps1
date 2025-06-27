#!/usr/bin/env pwsh

# Script para generar un JWT Secret seguro
Write-Host "🔐 Generando JWT Secret seguro..." -ForegroundColor Green

# Verificar si Node.js está disponible
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    
    # Generar JWT secret usando Node.js
    $jwtSecret = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    
    Write-Host "" -ForegroundColor White
    Write-Host "🔑 JWT Secret generado:" -ForegroundColor Yellow
    Write-Host $jwtSecret -ForegroundColor Cyan
    Write-Host "" -ForegroundColor White
    Write-Host "📋 Copia este valor y úsalo en tu archivo .env:" -ForegroundColor Yellow
    Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor White
    
} catch {
    Write-Host "❌ Node.js no está disponible. Generando alternativa..." -ForegroundColor Yellow
    
    # Generar usando PowerShell
    $bytes = New-Object byte[] 64
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $jwtSecret = [System.BitConverter]::ToString($bytes) -replace '-', ''
    
    Write-Host "" -ForegroundColor White
    Write-Host "🔑 JWT Secret generado (PowerShell):" -ForegroundColor Yellow
    Write-Host $jwtSecret.ToLower() -ForegroundColor Cyan
    Write-Host "" -ForegroundColor White
    Write-Host "📋 Copia este valor y úsalo en tu archivo .env:" -ForegroundColor Yellow
    Write-Host "JWT_SECRET=$($jwtSecret.ToLower())" -ForegroundColor White
}
