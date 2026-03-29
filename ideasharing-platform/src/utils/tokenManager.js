/**
 * Token Manager Utility
 * Handles access tokens, refresh tokens, and user data management
 */

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const tokenManager = {
  /**
   * Save authentication data to localStorage
   */
  saveTokens(accessToken, refreshToken, userData) {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
  },

  /**
   * Get access token from localStorage
   */
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Get user data from localStorage
   */
  getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Update only the access token
   */
  updateAccessToken(accessToken) {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!(this.getAccessToken() && this.getUser());
  },

  /**
   * Clear all authentication data
   */
  clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get authorization header for API calls
   */
  getAuthHeader() {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default tokenManager;
