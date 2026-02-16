const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

// Fonction utilitaire pour effectuer des requêtes HTTP
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });

    // Si le token a expiré, essayer de le rafraîchir
    if (response.status === 401 && token) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Réessayer la requête avec le nouveau token
        return fetchWithAuth(url, options);
      } else {
        // Déconnexion si le rafraîchissement échoue
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return null;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.detail || 'Une erreur est survenue');
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Si la réponse est 204 (No Content), ne pas essayer de parser le JSON
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Fonction pour rafraîchir le token
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

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    
    // Mettre à jour le refresh token si un nouveau est fourni
    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    return false;
  }
}

// API endpoints
export const authAPI = {
  login: (email, password) => 
    fetchWithAuth('/token/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: () => fetchWithAuth('/accounts/me/'),
  
  getUsers: () => fetchWithAuth('/accounts/users/'),
  
  getStats: () => fetchWithAuth('/stats/'),
  
  // Ajoutez d'autres endpoints API ici
};

export default fetchWithAuth;
