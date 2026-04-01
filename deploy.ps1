#!/usr/bin/env pwsh

# Script de despliegue para Academic Events
# Ejecutar desde la raíz del proyecto

Write-Host "🚀 Iniciando despliegue de Academic Events con Docker..." -ForegroundColor Green

$useDockerComposeV2 = $false

function Invoke-Compose {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Args
    )

    if ($script:useDockerComposeV2) {
        docker compose @Args
    } else {
        docker-compose @Args
    }
}

# ============================
# VALIDACIONES DE SEGURIDAD
# ============================

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: No se encontró el archivo .env" -ForegroundColor Red
    Write-Host "📋 Copia el archivo .env.example como .env y configura tus valores:" -ForegroundColor Yellow
    Write-Host "   Copy-Item .env.example .env" -ForegroundColor White
    Write-Host "   Luego edita el archivo .env con tus configuraciones reales" -ForegroundColor White
    exit 1
}

# Leer variables del .env para validaciones
$envContent = Get-Content ".env" | Where-Object { $_ -match "=" -and $_ -notmatch "^#" }
$envVars = @{}
foreach ($line in $envContent) {
    $key, $value = $line -split "=", 2
    $envVars[$key.Trim()] = $value.Trim()
}

# Validar que las variables críticas no tengan valores por defecto
$criticalVars = @{
    "POSTGRES_PASSWORD" = @("password123", "TuPasswordSuperSegura123!")
    "JWT_SECRET" = @("tu-jwt-secret-super-secreto-cambia-esto-por-algo-muy-seguro-y-unico", "your-secret-key")
    "SMTP_USER" = @("tu-email@gmail.com")
    "SMTP_PASS" = @("tu-password-de-aplicacion-de-gmail")
}

$hasInsecureDefaults = $false
foreach ($var in $criticalVars.Keys) {
    if ($envVars.ContainsKey($var)) {
        $value = $envVars[$var]
        if ($criticalVars[$var] -contains $value) {
            Write-Host "⚠️  Variable '$var' tiene un valor por defecto inseguro" -ForegroundColor Yellow
            $hasInsecureDefaults = $true
        }
    }
}

# Validar longitud del JWT_SECRET
if ($envVars.ContainsKey("JWT_SECRET")) {
    if ($envVars["JWT_SECRET"].Length -lt 32) {
        Write-Host "⚠️  JWT_SECRET es demasiado corto (mínimo 32 caracteres)" -ForegroundColor Yellow
        $hasInsecureDefaults = $true
    }
}

if ($hasInsecureDefaults) {
    Write-Host "" -ForegroundColor White
    Write-Host "🔐 RECOMENDACIONES DE SEGURIDAD:" -ForegroundColor Red
    Write-Host "1. Genera un JWT_SECRET seguro ejecutando: .\generate-jwt-secret.ps1" -ForegroundColor White
    Write-Host "2. Cambia POSTGRES_PASSWORD por una contraseña fuerte" -ForegroundColor White
    Write-Host "3. Configura SMTP_USER y SMTP_PASS con credenciales reales" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    
    $continue = Read-Host "¿Continuar de todas formas? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "👍 Configura las variables de seguridad y vuelve a intentarlo" -ForegroundColor Green
        exit 0
    }
}

# Verificar que Docker esté ejecutándose
Write-Host "📋 Verificando Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    try {
        docker compose version | Out-Null
        $useDockerComposeV2 = $true
    } catch {
        docker-compose --version | Out-Null
        $useDockerComposeV2 = $false
    }
    Write-Host "✅ Docker está instalado y funcionando" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker no está instalado o no está ejecutándose" -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

if ($useDockerComposeV2) {
    Write-Host "ℹ️ Usando 'docker compose' (plugin v2)" -ForegroundColor Cyan
} else {
    Write-Host "ℹ️ Usando 'docker-compose' (binario legacy)" -ForegroundColor Cyan
}

# Detener contenedores existentes si los hay
Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Yellow
Invoke-Compose down

# Limpiar imágenes antiguas (opcional)
$cleanup = Read-Host "¿Deseas limpiar imágenes antiguas? (y/N)"
if ($cleanup -eq "y" -or $cleanup -eq "Y") {
    Write-Host "🧹 Limpiando imágenes antiguas..." -ForegroundColor Yellow
    docker system prune -f
}

# Construir y levantar servicios
Write-Host "🔨 Construyendo imágenes..." -ForegroundColor Yellow
Invoke-Compose build --no-cache

Write-Host "🚀 Levantando servicios..." -ForegroundColor Yellow
Invoke-Compose up -d

# Esperar a que los servicios estén listos
Write-Host "⏳ Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verificar estado de los servicios
Write-Host "📊 Estado de los servicios:" -ForegroundColor Yellow
Invoke-Compose ps

$frontendPort = if ($envVars.ContainsKey("FRONTEND_PORT") -and $envVars["FRONTEND_PORT"]) { $envVars["FRONTEND_PORT"] } else { "8080" }
$backendPort = if ($envVars.ContainsKey("PORT") -and $envVars["PORT"]) { $envVars["PORT"] } else { "3000" }
$postgresPort = if ($envVars.ContainsKey("POSTGRES_PORT") -and $envVars["POSTGRES_PORT"]) { $envVars["POSTGRES_PORT"] } else { "5432" }

Write-Host "" -ForegroundColor White
Write-Host "🎉 ¡Despliegue completado!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📱 Frontend: http://localhost:$frontendPort" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:$backendPort" -ForegroundColor Cyan
Write-Host "🗄️  PostgreSQL: localhost:$postgresPort" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "Para ver los logs:" -ForegroundColor Yellow
if ($useDockerComposeV2) {
    Write-Host "  docker compose logs -f" -ForegroundColor White
} else {
    Write-Host "  docker-compose logs -f" -ForegroundColor White
}
Write-Host "" -ForegroundColor White
Write-Host "Para detener los servicios:" -ForegroundColor Yellow
if ($useDockerComposeV2) {
    Write-Host "  docker compose down" -ForegroundColor White
} else {
    Write-Host "  docker-compose down" -ForegroundColor White
}
