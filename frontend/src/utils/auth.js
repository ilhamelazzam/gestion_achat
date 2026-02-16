// Auth utility functions

// Token keys
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

// Function to store authentication tokens
export const setAuthTokens = (tokens) => {
  if (tokens && tokens.access) {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('accessToken', tokens.access);
  }
  if (tokens && tokens.refresh) {
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('refreshToken', tokens.refresh);
  }
};

// Function to retrieve the access token
export const getAccessToken = () => {
  return localStorage.getItem('access_token') || localStorage.getItem('accessToken');
};

// Function to retrieve the refresh token
export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken');
};

// Function to store user data
export const setUserData = (userData) => {
  if (userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  }
};

// Function to retrieve user data
export const getUserData = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Function to check if the user is authenticated
export const isAuthenticated = () => {
  return !!getAccessToken();
};

// Function to check if the user is an administrator
export const isAdmin = () => {
  const user = getUserData();
  if (!user) return false;
  return user.isAdmin === true || user.is_admin === true;
};

// Function to log out the user
export const logout = () => {
  // Supprimer tous les éléments liés à l'authentification
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Effacer également les données de session
  sessionStorage.clear();
  
  // Rediriger vers la page de connexion
  window.location.href = '/loginuser';
};

// Function to configure authentication headers
export const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};
