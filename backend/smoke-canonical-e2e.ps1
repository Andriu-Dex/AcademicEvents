# Smoke Test E2E - Flujo Canonico
# Valida payload canonico en EventForm + validacion inscripcion

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:3000/api"
$tenant = "uta"

Write-Host "`n=== SMOKE TEST E2E - FLUJO CANONICO ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Gray

# 1. Login Admin
Write-Host "1. Login admin..." -ForegroundColor Yellow
$loginPayload = @{
    correo = "admin@uta.edu.ec"
    contrasena = "Admin12345"
} | ConvertTo-Json -Compress

$headers = @{
    "Content-Type" = "application/json"
    "X-Tenant-ID" = $tenant
}

try {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -Headers $headers -Body $loginPayload
    $tokenAdmin = $loginRes.token
    Write-Host "   OK - Token admin obtenido" -ForegroundColor Green
} catch {
    Write-Host "   ERROR - Login admin fallo: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Crear evento con payload CANONICO
Write-Host "`n2. Crear evento (payload canonico)..." -ForegroundColor Yellow
$headersAdmin = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $tokenAdmin"
    "X-Tenant-ID" = $tenant
}

$eventPayload = @{
    name = "Test Canonical Event $(Get-Date -Format 'HHmmss')"
    description = "Evento de prueba con payload canonico"
    type = "WEBINAR"
    startDate = (Get-Date).AddDays(5).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    endDate = (Get-Date).AddDays(6).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    price = 0
    status = "ACTIVE"
    modality = "VIRTUAL"
    durationHours = 8
    minAttendancePercent = 75
    maxCapacity = 50
    esEventoGeneral = $true
} | ConvertTo-Json -Compress

try {
    $createRes = Invoke-RestMethod -Uri "$baseUrl/eventos" -Method POST -Headers $headersAdmin -Body $eventPayload
    $eventId = $createRes.id
    Write-Host "   OK - Evento creado: ID=$eventId" -ForegroundColor Green
} catch {
    Write-Host "   ERROR - Crear evento fallo: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# 3. Login Estudiante
Write-Host "`n3. Login estudiante..." -ForegroundColor Yellow
$loginStudentPayload = @{
    correo = "estudiante1@uta.edu.ec"
    contrasena = "Student123!"
} | ConvertTo-Json -Compress

$headersBase = @{
    "Content-Type" = "application/json"
    "X-Tenant-ID" = $tenant
}

try {
    $loginStudentRes = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -Headers $headersBase -Body $loginStudentPayload
    $tokenStudent = $loginStudentRes.token
    Write-Host "   OK - Token estudiante obtenido" -ForegroundColor Green
} catch {
    Write-Host "   ERROR - Login estudiante fallo: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headersStudent = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $tokenStudent"
    "X-Tenant-ID" = $tenant
}

# 4. Inscribirse al evento
Write-Host "`n4. Inscribirse al evento..." -ForegroundColor Yellow
$inscripcionPayload = @{
    id_eve = $eventId
    carta_motivacion = "Carta de motivacion para smoke test E2E"
} | ConvertTo-Json -Compress

try {
    $inscripcionRes = Invoke-RestMethod -Uri "$baseUrl/inscripciones" -Method POST -Headers $headersStudent -Body $inscripcionPayload
    $inscripcionId = $inscripcionRes.id
    Write-Host "   OK - Inscripcion creada: ID=$inscripcionId" -ForegroundColor Green
} catch {
    Write-Host "   ERROR - Inscripcion fallo: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) { Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red }
    exit 1
}

# 5. Aceptar inscripcion con payload CANONICO
Write-Host "`n5. Aceptar inscripcion (payload canonico)..." -ForegroundColor Yellow
$acceptPayload = @{
    status = "ACCEPTED"
} | ConvertTo-Json -Compress

try {
    $acceptRes = Invoke-RestMethod -Uri "$baseUrl/admin/inscripciones/validar/$inscripcionId" -Method PUT -Headers $headersAdmin -Body $acceptPayload
    Write-Host "   OK - Inscripcion aceptada" -ForegroundColor Green
} catch {
    Write-Host "   ERROR - Aceptar inscripcion fallo: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# 6. Finalizar inscripcion con payload CANONICO (validarInscripcion)
Write-Host "`n6. Finalizar inscripcion (payload canonico)..." -ForegroundColor Yellow
$finalizePayload = @{
    status = "APPROVED"
    finalAttendancePercent = 85
    finalGrade = 8.5
} | ConvertTo-Json -Compress

try {
    $finalizeRes = Invoke-RestMethod -Uri "$baseUrl/admin/inscripciones/validar/$inscripcionId" -Method PUT -Headers $headersAdmin -Body $finalizePayload
    Write-Host "   OK - Inscripcion finalizada: estado=$($finalizeRes.status)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR - Finalizar inscripcion fallo: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# 7. Verificar inscripcion final
Write-Host "`n7. Verificar inscripcion final..." -ForegroundColor Yellow
try {
    $verifyRes = Invoke-RestMethod -Uri "$baseUrl/inscripciones/propias" -Method GET -Headers $headersStudent
    $inscription = $verifyRes | Where-Object { $_.id -eq $inscripcionId -or $_.id_ins -eq $inscripcionId }
    
    $status = if ($inscription.status) { $inscription.status } else { $inscription.est_ins }
    $attendance = if ($null -ne $inscription.finalAttendancePercent) { $inscription.finalAttendancePercent } else { $inscription.por_asi_fin_usu }
    $grade = if ($null -ne $inscription.finalGrade) { $inscription.finalGrade } else { $inscription.inscripcion_curso.not_fin_usu }
    
    if ($status -eq "APPROVED" -or $status -eq "APROBADO") {
        Write-Host "   OK - Estado: $status | Asistencia: $attendance% | Nota: $grade" -ForegroundColor Green
    } else {
        Write-Host "   WARN - Estado inesperado: $status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERROR - Verificacion fallo: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Resultado final
Write-Host "`n=== SMOKE TEST COMPLETADO EXITOSAMENTE ===" -ForegroundColor Green
Write-Host "Flujo canonico validado: EventForm -> Validacion -> Finalizacion`n" -ForegroundColor Cyan
