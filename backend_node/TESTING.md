 🧪 Guide de Test du Backend - Table Request

## Méthodes de Test Disponibles

### 1️⃣ Test Direct de la Base de Données (Recommandé pour débuter)

Test rapide sans serveur, directement dans la base de données :

```bash
node scripts/test-requests-simple.js
```

**Affiche :**
- Nombre total de demandes
- Liste détaillée de toutes les demandes
- Statistiques par statut (En attente, Approuvée, etc.)
- Statistiques par utilisateur
- Liste des demandes urgentes

---

### 2️⃣ Test de l'API REST Complet

Test des endpoints HTTP avec authentification :

```bash
# Avec vos identifiants
node scripts/test-requests-api.js votre.email@example.com VotreMotDePasse

# Ou avec les identifiants par défaut
node scripts/test-requests-api.js
```

**Ce script teste :**
- ✅ GET /api/demandes/ - Liste des demandes
- ✅ GET /api/demandes/:id/ - Détails d'une demande
- ✅ POST /api/demandes/ - Créer une demande
- ✅ PUT /api/demandes/:id/ - Modifier une demande
- ✅ DELETE /api/demandes/:id/ - Supprimer une demande

---

### 3️⃣ Test Manuel avec Thunder Client / Postman

#### Étape 1 : Connexion

**POST** `http://localhost:8000/api/utilisateurs/login/`

```json
{
  "email": "elazzamilham@gmail.com",
  "password": "VotreMotDePasse"
}
```

**Réponse :**
```json
{
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs..."
  },
  "user": {...}
}
```

Copiez le `access` token pour les requêtes suivantes.

---

#### Étape 2 : Liste des demandes

**GET** `http://localhost:8000/api/demandes/`

**Headers :**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

---

#### Étape 3 : Créer une demande

**POST** `http://localhost:8000/api/demandes/`

**Headers :**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
Content-Type: application/json
```

**Body :**
```json
{
  "productName": "Clavier mécanique",
  "quantity": 5,
  "urgency": "Normale",
  "justification": "Remplacement de claviers défectueux",
  "estimatedCost": 350
}
```

---

#### Étape 4 : Détails d'une demande

**GET** `http://localhost:8000/api/demandes/1/`

**Headers :**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

---

#### Étape 5 : Modifier une demande

**PUT** `http://localhost:8000/api/demandes/1/`

**Headers :**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
Content-Type: application/json
```

**Body (utilisateur) :**
```json
{
  "quantity": 10,
  "urgency": "Urgente",
  "justification": "Besoin urgent - projet prioritaire"
}
```

**Body (admin) :**
```json
{
  "status": "Approuvée"
}
```

---

#### Étape 6 : Supprimer une demande

**DELETE** `http://localhost:8000/api/demandes/1/`

**Headers :**
```
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

---

### 4️⃣ Test avec cURL (PowerShell)

#### Connexion
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/utilisateurs/login/" -Method POST -ContentType "application/json" -Body '{"email":"elazzamilham@gmail.com","password":"VotreMotDePasse"}'
$data = $response.Content | ConvertFrom-Json
$token = $data.tokens.access
```

#### Liste des demandes
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/demandes/" -Headers @{"Authorization"="Bearer $token"} | Select-Object -ExpandProperty Content
```

#### Créer une demande
```powershell
$body = @{
    productName = "Souris ergonomique"
    quantity = 3
    urgency = "Normale"
    justification = "Prévention troubles musculosquelettiques"
    estimatedCost = 120
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/demandes/" -Method POST -Headers @{"Authorization"="Bearer $token";"Content-Type"="application/json"} -Body $body | Select-Object -ExpandProperty Content
```

---

## 📊 Vérification dans la Base de Données

### pgAdmin ou psql

```sql
-- Toutes les demandes
SELECT * FROM "Request" ORDER BY "createdAt" DESC;

-- Demandes par statut
SELECT status, COUNT(*) 
FROM "Request" 
GROUP BY status;

-- Demandes d'un utilisateur
SELECT * FROM "Request" 
WHERE "userEmail" = 'elazzamilham@gmail.com';

-- Demandes urgentes en attente
SELECT * FROM "Request" 
WHERE urgency IN ('Urgente', 'Très urgente') 
  AND status = 'En attente';
```

---

## ✅ Points à Vérifier

- [ ] Les demandes sont créées avec un numéro unique (REQ-XXX)
- [ ] L'utilisateur ne voit que ses propres demandes
- [ ] L'admin voit toutes les demandes
- [ ] L'utilisateur peut modifier sa demande "En attente"
- [ ] L'utilisateur ne peut pas modifier une demande "Approuvée"
- [ ] L'admin peut changer le statut de n'importe quelle demande
- [ ] Le coût total est bien calculé dans les statistiques
- [ ] Les filtres par statut fonctionnent
- [ ] Les demandes urgentes sont bien identifiées

---

## 🐛 Dépannage

### Erreur 401 - Non authentifié
→ Vérifiez que le token est valide et bien passé dans le header `Authorization`

### Erreur 403 - Accès refusé
→ Vous essayez peut-être d'accéder à une demande d'un autre utilisateur

### Erreur 404 - Demande non trouvée
→ Vérifiez que l'ID existe dans la base de données

### Le serveur ne répond pas
→ Vérifiez que le backend est démarré : `npm run dev`

---

## 📝 Créer des Données de Test

```bash
# Créer un utilisateur de test
node scripts/create-test-user.js

# Créer des demandes de test
node scripts/create-test-requests.js
```
