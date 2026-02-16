const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

/**
 * Effectue une requête HTTP avec authentification automatique
 * @param {string} endpoint - L'URL de l'endpoint (sans le préfixe /api)
 * @param {Object} options - Options de la requête fetch
 * @returns {Promise<any>} - Les données de la réponse
 */
async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  
  // Configuration des en-têtes par défaut
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Ajout du token d'authentification s'il existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Si non autorisé, essayer de rafraîchir le token
    if (response.status === 401 && token) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return apiClient(endpoint, options);
      } else {
        // Déconnexion si le rafraîchissement échoue
        logout();
        return null;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.detail || 'Une erreur est survenue');
      error.status = response.status;
      throw error;
    }

    // Ne pas essayer de parser le JSON si la réponse est vide
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Rafraîchit le token d'authentification
 */
async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    
    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    return false;
  }
}

/**
 * Déconnecte l'utilisateur
 */
function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

// Méthodes HTTP prédéfinies
const http = {
  get: (endpoint, options = {}) => 
    apiClient(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, data = {}, options = {}) =>
    apiClient(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (endpoint, data = {}, options = {}) =>
    apiClient(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (endpoint, options = {}) =>
    apiClient(endpoint, { ...options, method: 'DELETE' }),
};

// API endpoints
export const api = {
  // Auth
  login: (credentials) => http.post('/token/', credentials),
  getCurrentUser: () => http.get('/accounts/me/'),
  
  // Users
  getUsers: () => http.get('/accounts/users/'),
  
  // Stats
  getStats: () => http.get('/stats/'),
  
  // Ajoutez d'autres endpoints ici
};

export { logout };
export default http;
