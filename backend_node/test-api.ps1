# Script de test de l'API des demandes
# Usage: .\test-api.ps1

Write-Host "`n🚀 Test de l'API des demandes" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Configuration
$API_BASE = "http://localhost:8000/api"
$EMAIL = "elazzamilham@gmail.com"  # Changez ici
$PASSWORD = "Password123!"          # Changez ici

# =============================================================================
# ÉTAPE 1 : CONNEXION
# =============================================================================
Write-Host "`n🔐 ÉTAPE 1 : Connexion..." -ForegroundColor Yellow
Write-Host "-" * 60

$loginBody = @{
    email = $EMAIL
    password = $PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/utilisateurs/login/" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    $TOKEN = $loginResponse.tokens.access
    Write-Host "✅ Connexion réussie !" -ForegroundColor Green
    Write-Host "   Email: $($loginResponse.user.email)" -ForegroundColor Gray
    Write-Host "   Nom: $($loginResponse.user.nom)" -ForegroundColor Gray
    Write-Host "   Token: $($TOKEN.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur de connexion : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Headers pour les requêtes suivantes
$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# =============================================================================
# ÉTAPE 2 : LISTE DES DEMANDES
# =============================================================================
Write-Host "`n📋 ÉTAPE 2 : Récupération de toutes les demandes..." -ForegroundColor Yellow
Write-Host "-" * 60

try {
    $requests = Invoke-RestMethod -Uri "$API_BASE/demandes/" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $TOKEN"}
    
    Write-Host "✅ $($requests.Count) demandes trouvées" -ForegroundColor Green
    
    foreach ($req in $requests) {
        $statusColor = switch ($req.status) {
            "En attente" { "Yellow" }
            "Approuvée"  { "Green" }
            "Rejetée"    { "Red" }
            "En cours"   { "Cyan" }
            "Livrée"     { "Blue" }
            default      { "White" }
        }
        
        Write-Host "`n   $($req.requestNumber) - $($req.productName)" -ForegroundColor White
        Write-Host "   Status: $($req.status)" -ForegroundColor $statusColor
        Write-Host "   Quantité: $($req.quantity)" -ForegroundColor Gray
        Write-Host "   Coût: $($req.estimatedCost)€" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur : $($_.Exception.Message)" -ForegroundColor Red
}

# =============================================================================
# ÉTAPE 3 : DÉTAILS D'UNE DEMANDE
# =============================================================================
if ($requests.Count -gt 0) {
    $firstId = $requests[0].id
    Write-Host "`n🔍 ÉTAPE 3 : Détails de la demande #$firstId..." -ForegroundColor Yellow
    Write-Host "-" * 60
    
    try {
        $requestDetail = Invoke-RestMethod -Uri "$API_BASE/demandes/$firstId/" `
            -Method GET `
            -Headers @{"Authorization" = "Bearer $TOKEN"}
        
        Write-Host "✅ Demande récupérée :" -ForegroundColor Green
        Write-Host "   Numéro: $($requestDetail.requestNumber)" -ForegroundColor Gray
        Write-Host "   Produit: $($requestDetail.productName)" -ForegroundColor Gray
        Write-Host "   Quantité: $($requestDetail.quantity)" -ForegroundColor Gray
        Write-Host "   Urgence: $($requestDetail.urgency)" -ForegroundColor Gray
        Write-Host "   Status: $($requestDetail.status)" -ForegroundColor Gray
        Write-Host "   Coût estimé: $($requestDetail.estimatedCost)€" -ForegroundColor Gray
        Write-Host "   Justification: $($requestDetail.justification)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Erreur : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# =============================================================================
# ÉTAPE 4 : CRÉER UNE NOUVELLE DEMANDE
# =============================================================================
Write-Host "`n➕ ÉTAPE 4 : Création d'une nouvelle demande..." -ForegroundColor Yellow
Write-Host "-" * 60

$newRequestBody = @{
    productName = "Casque audio sans fil"
    quantity = 3
    urgency = "Normale"
    justification = "Équipement pour salle de réunion"
    estimatedCost = 180
} | ConvertTo-Json

try {
    $newRequest = Invoke-RestMethod -Uri "$API_BASE/demandes/" `
        -Method POST `
        -Headers $headers `
        -Body $newRequestBody
    
    Write-Host "✅ Demande créée avec succès !" -ForegroundColor Green
    Write-Host "   Numéro: $($newRequest.requestNumber)" -ForegroundColor Gray
    Write-Host "   Produit: $($newRequest.productName)" -ForegroundColor Gray
    Write-Host "   Status: $($newRequest.status)" -ForegroundColor Gray
    Write-Host "   ID: $($newRequest.id)" -ForegroundColor Gray
    
    $createdId = $newRequest.id
} catch {
    Write-Host "❌ Erreur : $($_.Exception.Message)" -ForegroundColor Red
    $createdId = $null
}

# =============================================================================
# ÉTAPE 5 : MODIFIER LA DEMANDE CRÉÉE
# =============================================================================
if ($createdId) {
    Write-Host "`n✏️ ÉTAPE 5 : Modification de la demande #$createdId..." -ForegroundColor Yellow
    Write-Host "-" * 60
    
    $updateBody = @{
        quantity = 5
        urgency = "Urgente"
        justification = "Besoin urgent - réunion client importante"
    } | ConvertTo-Json
    
    try {
        $updatedRequest = Invoke-RestMethod -Uri "$API_BASE/demandes/$createdId/" `
            -Method PUT `
            -Headers $headers `
            -Body $updateBody
        
        Write-Host "✅ Demande mise à jour !" -ForegroundColor Green
        Write-Host "   Nouvelle quantité: $($updatedRequest.quantity)" -ForegroundColor Gray
        Write-Host "   Nouvelle urgence: $($updatedRequest.urgency)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Erreur : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# =============================================================================
# ÉTAPE 6 : SUPPRIMER LA DEMANDE CRÉÉE
# =============================================================================
if ($createdId) {
    Write-Host "`n🗑️ ÉTAPE 6 : Suppression de la demande #$createdId..." -ForegroundColor Yellow
    Write-Host "-" * 60
    
    try {
        Invoke-RestMethod -Uri "$API_BASE/demandes/$createdId/" `
            -Method DELETE `
            -Headers @{"Authorization" = "Bearer $TOKEN"}
        
        Write-Host "✅ Demande supprimée avec succès !" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# =============================================================================
# RÉSUMÉ
# =============================================================================
Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "✅ Tests terminés !" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
