#!/usr/bin/env pwsh

# Script para verificar vulnerabilidades en imágenes Docker
Write-Host "🔍 Verificando vulnerabilidades en imágenes Docker..." -ForegroundColor Yellow

# Verificar si Docker está disponible
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker no está disponible" -ForegroundColor Red
    exit 1
}

# Función para verificar vulnerabilidades usando docker scout (si está disponible)
function Test-DockerVulnerabilities {
    param($imageName)
    
    Write-Host "🔍 Verificando vulnerabilidades en $imageName..." -ForegroundColor Yellow
    
    # Intentar usar Docker Scout si está disponible
    try {
        $scoutResult = docker scout cves --format table $imageName 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "📊 Resultados de Docker Scout para $imageName" -ForegroundColor Cyan
            Write-Host $scoutResult
        } else {
            Write-Host "ℹ️  Docker Scout no disponible, usando verificación básica" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "ℹ️  Docker Scout no disponible" -ForegroundColor Yellow
    }
    
    # Verificar fecha de la imagen
    try {
        $imageInfo = docker inspect $imageName --format '{{.Created}}' 2>$null
        if ($LASTEXITCODE -eq 0) {
            $imageDate = [DateTime]::Parse($imageInfo.Split('T')[0])
            $daysSinceCreated = ((Get-Date) - $imageDate).Days
            
            if ($daysSinceCreated -gt 90) {
                Write-Host "⚠️  Imagen $imageName tiene $daysSinceCreated días de antigüedad" -ForegroundColor Yellow
                Write-Host "   Considera usar una versión más reciente" -ForegroundColor White
            } else {
                Write-Host "✅ Imagen $imageName es relativamente reciente ($daysSinceCreated días)" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "⚠️  No se pudo verificar la fecha de $imageName" -ForegroundColor Yellow
    }
}

# Imágenes base utilizadas en el proyecto
$images = @(
    "node:20-alpine",
    "nginx:1.27-alpine", 
    "postgres:15-alpine"
)

Write-Host "🐳 Verificando imágenes base del proyecto..." -ForegroundColor Cyan
Write-Host ""

foreach ($image in $images) {
    Write-Host "=" * 50 -ForegroundColor Gray
    
    # Intentar pull de la imagen más reciente
    Write-Host "📥 Descargando imagen más reciente: $image" -ForegroundColor Blue
    try {
        docker pull $image | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Imagen $image actualizada" -ForegroundColor Green
            Test-DockerVulnerabilities $image
        } else {
            Write-Host "❌ Error al descargar $image" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error al verificar $image" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "=" * 50 -ForegroundColor Gray
Write-Host "📋 RECOMENDACIONES:" -ForegroundColor Yellow
Write-Host "1. Mantén las imágenes actualizadas regularmente" -ForegroundColor White
Write-Host "2. Ejecuta 'docker system prune' para limpiar imágenes antiguas" -ForegroundColor White
Write-Host "3. Considera usar 'docker scout' para análisis detallado" -ForegroundColor White
Write-Host "4. Revisa CVE databases para vulnerabilidades específicas" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Recursos útiles:" -ForegroundColor Cyan
Write-Host "   - Docker Scout: https://docs.docker.com/scout/" -ForegroundColor White
Write-Host "   - CVE Database: https://cve.mitre.org/" -ForegroundColor White
Write-Host "   - Node.js Security: https://nodejs.org/en/security/" -ForegroundColor White
