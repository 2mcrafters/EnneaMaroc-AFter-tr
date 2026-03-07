// Minimal auth helper used by Header components
// Replace with real backend integration when ready

const TOKEN_KEY = "ennea_token";
const ROLE_KEY = "ennea_role";

export const auth = {
  isAuthenticated() {
    try {
      return !!localStorage.getItem(TOKEN_KEY);
    } catch {
      return false;
    }
  },

  async isAdmin() {
    try {
      return localStorage.getItem(ROLE_KEY) === "admin";
    } catch {
      return false;
    }
  },

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  setRole(role) {
    localStorage.setItem(ROLE_KEY, role);
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
};
