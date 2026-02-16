import { API_ENDPOINTS, DEFAULT_HEADERS } from '../config';

/**
 * Service d'authentification pour gérer les opérations liées à l'authentification
 */
class AuthService {
  /**
   * Tente de se connecter avec un email et un mot de passe
   * @param {string} email - L'email de l'utilisateur
   * @param {string} password - Le mot de passe de l'utilisateur
   * @returns {Promise<Object>} Les données de l'utilisateur connecté
   */
  static async login(email, password) {
    // 1. Récupérer le token CSRF
    await this._fetchCSRFToken();
    
    // 2. Effectuer la requête de connexion
    const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        'X-CSRFToken': this._getCSRFToken(),
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await this._handleError(response);
      throw error;
    }

    const data = await response.json();
    
    // 3. Sauvegarder le token d'accès
    if (data.access) {
      localStorage.setItem('access_token', data.access);
      
      // 4. Récupérer les informations de l'utilisateur
      const user = await this.getCurrentUser();
      return { user, tokens: data };
    }

    throw new Error("Aucun token d'accès reçu");
  }

  /**
   * Déconnecte l'utilisateur
   */
  static logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    // Vous pouvez ajouter un appel API pour invalider le token côté serveur si nécessaire
  }

  /**
   * Récupère les informations de l'utilisateur actuellement connecté
   * @returns {Promise<Object>} Les données de l'utilisateur
   */
  static async getCurrentUser() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Aucun utilisateur connecté');
    }

    const response = await fetch(API_ENDPOINTS.AUTH.ME, {
      headers: {
        ...DEFAULT_HEADERS,
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      // Si l'erreur est une erreur d'authentification, on déconnecte l'utilisateur
      if (response.status === 401) {
        this.logout();
        window.location.href = '/login';
      }
      
      const error = await this._handleError(response);
      throw error;
    }

    const user = await response.json();
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   * @returns {boolean} true si l'utilisateur est authentifié, false sinon
   */
  static isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Récupère le token d'authentification
   * @returns {string|null} Le token d'authentification ou null si non connecté
   */
  static getAuthToken() {
    return localStorage.getItem('access_token');
  }

  /**
   * Récupère le token CSRF
   * @private
   */
  static async _fetchCSRFToken() {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.CSRF, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du token CSRF');
      }

      return true;
    } catch (error) {
      console.error('Erreur CSRF:', error);
      throw error;
    }
  }

  /**
   * Récupère le token CSRF depuis les cookies
   * @private
   */
  static _getCSRFToken() {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1] || '';
  }

  /**
   * Gère les erreurs de l'API
   * @private
   */
  static async _handleError(response) {
    let errorMessage = 'Une erreur est survenue';
    
    try {
      const errorData = await response.json();
      
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.non_field_errors) {
        errorMessage = errorData.non_field_errors.join(' ');
      } else if (typeof errorData === 'object') {
        // Pour les erreurs de validation de formulaire
        const firstError = Object.values(errorData)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      }
    } catch (e) {
      // En cas d'erreur de parsing de la réponse d'erreur
      errorMessage = `Erreur ${response.status}: ${response.statusText}`;
    }
    
    const error = new Error(errorMessage);
    error.status = response.status;
    error.response = response;
    
    return error;
  }
}

export default AuthService;
