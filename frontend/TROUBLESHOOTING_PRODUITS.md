# 🔍 Guide de dépannage - Affichage des produits

## Problème
La liste des produits de la base de données ne s'affiche pas dans l'interface du dashboard.

## Solutions possibles

### 1. Vérifier que le backend Django est démarré
```bash
cd backend
python manage.py runserver
```

Le serveur doit être accessible sur `http://localhost:8000`

### 2. Tester l'API manuellement
Ouvrez votre navigateur et allez sur :
- `http://localhost:8000/api/` - Page d'accueil de l'API
- `http://localhost:8000/api/produits/` - Liste des produits
- `http://localhost:8000/api/utilisateurs/` - Liste des utilisateurs

### 3. Vérifier la console du navigateur
- Ouvrez les outils de développement (F12)
- Allez dans l'onglet "Console"
- Regardez s'il y a des erreurs lors du chargement de la page

### 4. Vérifier la configuration
Dans `frontend/src/config.js`, l'URL doit être :
```javascript
baseURL: 'http://localhost:8000/api'
```

### 5. Vérifier les URLs Django
- `backend/urls.py` : `path('api/', include('core.urls'))`
- `backend/core/urls.py` : `router.register(r'produits', ProduitViewSet)`

L'URL finale doit être : `http://localhost:8000/api/produits/`

### 6. Tester avec curl
```bash
curl http://localhost:8000/api/produits/
```

### 7. Vérifier les migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### 8. Vérifier les données dans la base
```bash
cd backend
python manage.py shell
```

```python
from core.models import Produit
Produit.objects.all()
```

## Diagnostic automatique
Le dashboard affiche maintenant des informations de diagnostic :
- URL de l'API testée
- État de chargement
- Erreurs détectées
- Nombre de produits reçus
- Bouton de test manuel de l'API

## Si le problème persiste
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les logs Django dans le terminal
3. Vérifiez que les modèles sont bien enregistrés dans `admin.py`
4. Vérifiez les permissions CORS si nécessaire


