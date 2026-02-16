/**
 * Configuration de l'application
 */

// URL de base de l'API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Endpoints de l'API
export const API_ENDPOINTS = {
  AUTH: {
    // Authentification administrateur
    ADMIN: {
      LOGIN: `${API_BASE_URL}/administrateurs/login/`,
      REGISTER: `${API_BASE_URL}/accounts/register/admin/`,
      ME: `${API_BASE_URL}/accounts/me/`,
    },
    // Authentification utilisateur
    USER: {
      LOGIN: `${API_BASE_URL}/utilisateurs/login/`,
      REGISTER: `${API_BASE_URL}/utilisateurs/register/`, // Fix incorrect user registration endpoint
      ME: `${API_BASE_URL}/me/`,
    },
    // Tokens
    TOKEN: {
      REFRESH: `${API_BASE_URL}/token/refresh/`,
    },
  },
  ADMIN: {
    BASE: `${API_BASE_URL}/administrateurs/`,
  },
  USERS: {
    BASE: `${API_BASE_URL}/utilisateurs/`,
  },
  PRODUCTS: {
    BASE: `${API_BASE_URL}/produits/`,
  },
  ORDERS: {
    BASE: `${API_BASE_URL}/commandes/`,
  },
  SUPPLIERS: {
    BASE: `${API_BASE_URL}/fournisseurs/`,
  },
  REQUESTS: {
    BASE: `${API_BASE_URL}/demandes/`,
    LIST: `${API_BASE_URL}/demandes/`,
    CREATE: `${API_BASE_URL}/demandes/`,
    DETAIL: (id) => `${API_BASE_URL}/demandes/${id}/`,
    UPDATE: (id) => `${API_BASE_URL}/demandes/${id}/`,
    DELETE: (id) => `${API_BASE_URL}/demandes/${id}/`,
  },
};

// Configuration des en-têtes par défaut
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Configuration des cookies
const COOKIE_CONFIG = {
  PATH: '/',
  SAME_SITE: 'Lax',
  SECURE: process.env.NODE_ENV === 'production',
};

export {
  API_BASE_URL,
  DEFAULT_HEADERS,
  COOKIE_CONFIG,
};
