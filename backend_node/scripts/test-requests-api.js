import fetch from 'node-fetch';

const API_BASE = 'http://localhost:8000/api';

// Fonction pour se connecter et obtenir un token
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE}/utilisateurs/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tokens.access;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    throw error;
  }
}

// Test 1: Récupérer toutes les demandes
async function testGetRequests(token) {
  console.log('\n📋 Test 1: GET /api/demandes/');
  console.log('─'.repeat(50));
  
  try {
    const response = await fetch(`${API_BASE}/demandes/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const requests = await response.json();
    console.log(`✅ ${requests.length} demandes trouvées`);
    
    requests.forEach(req => {
      console.log(`   ${req.requestNumber} - ${req.productName} (${req.status})`);
    });
    
    return requests;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return [];
  }
}

// Test 2: Récupérer une demande spécifique
async function testGetRequestById(token, id) {
  console.log(`\n🔍 Test 2: GET /api/demandes/${id}/`);
  console.log('─'.repeat(50));
  
  try {
    const response = await fetch(`${API_BASE}/demandes/${id}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const request = await response.json();
    console.log('✅ Demande trouvée:');
    console.log(`   Numéro: ${request.requestNumber}`);
    console.log(`   Produit: ${request.productName}`);
    console.log(`   Quantité: ${request.quantity}`);
    console.log(`   Urgence: ${request.urgency}`);
    console.log(`   Statut: ${request.status}`);
    console.log(`   Coût estimé: ${request.estimatedCost}€`);
    console.log(`   Justification: ${request.justification}`);
    
    return request;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

// Test 3: Créer une nouvelle demande
async function testCreateRequest(token) {
  console.log('\n➕ Test 3: POST /api/demandes/');
  console.log('─'.repeat(50));
  
  const newRequest = {
    productName: 'Souris sans fil Logitech',
    quantity: 10,
    urgency: 'Normale',
    justification: 'Équipement pour nouveaux postes de travail',
    estimatedCost: 250
  };
  
  try {
    const response = await fetch(`${API_BASE}/demandes/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newRequest)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    const created = await response.json();
    console.log('✅ Demande créée:');
    console.log(`   Numéro: ${created.requestNumber}`);
    console.log(`   Produit: ${created.productName}`);
    console.log(`   Quantité: ${created.quantity}`);
    console.log(`   Statut: ${created.status}`);
    
    return created;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

// Test 4: Modifier une demande
async function testUpdateRequest(token, id) {
  console.log(`\n✏️ Test 4: PUT /api/demandes/${id}/`);
  console.log('─'.repeat(50));
  
  const updates = {
    quantity: 15,
    urgency: 'Urgente',
    justification: 'Besoin urgent - projet prioritaire'
  };
  
  try {
    const response = await fetch(`${API_BASE}/demandes/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    const updated = await response.json();
    console.log('✅ Demande mise à jour:');
    console.log(`   Numéro: ${updated.requestNumber}`);
    console.log(`   Nouvelle quantité: ${updated.quantity}`);
    console.log(`   Nouvelle urgence: ${updated.urgency}`);
    
    return updated;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

// Test 5: Supprimer une demande
async function testDeleteRequest(token, id) {
  console.log(`\n🗑️ Test 5: DELETE /api/demandes/${id}/`);
  console.log('─'.repeat(50));
  
  try {
    const response = await fetch(`${API_BASE}/demandes/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok && response.status !== 204) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }
    
    console.log('✅ Demande supprimée avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('\n🚀 Tests de l\'API des demandes');
  console.log('═'.repeat(50));
  
  // Connexion
  console.log('\n🔐 Connexion...');
  const email = process.argv[2] || 'elazzamilham@gmail.com'; // Email depuis args ou défaut
  const password = process.argv[3] || 'Password123!'; // Mot de passe depuis args ou défaut
  
  console.log(`   Email: ${email}`);
  console.log(`   Usage: node scripts/test-requests-api.js <email> <password>`);
  
  let token;
  try {
    token = await login(email, password);
    console.log('✅ Connecté avec succès');
  } catch (error) {
    console.error('❌ Impossible de se connecter. Vérifiez vos identifiants.');
    process.exit(1);
  }
  
  // Test 1: Lister les demandes
  const requests = await testGetRequests(token);
  
  // Test 2: Récupérer une demande spécifique
  if (requests.length > 0) {
    await testGetRequestById(token, requests[0].id);
  }
  
  // Test 3: Créer une nouvelle demande
  const newRequest = await testCreateRequest(token);
  
  // Test 4: Modifier la demande créée
  if (newRequest) {
    await testUpdateRequest(token, newRequest.id);
  }
  
  // Test 5: Supprimer la demande créée
  if (newRequest) {
    await testDeleteRequest(token, newRequest.id);
  }
  
  // Résumé final
  console.log('\n' + '═'.repeat(50));
  console.log('✅ Tests terminés !');
  console.log('═'.repeat(50) + '\n');
}

// Lancer les tests
runAllTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
