// Service d'authentification
import { BaseApiService } from './baseApi';

export interface LoginResponse {
  user: any;
  token: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'employee' | 'prof' | 'student';
  profilePicture?: string;
  dob?: string;
  city?: string;
  phone?: string;
}

class AuthService extends BaseApiService {
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(firstName: string, lastName: string, email: string, password: string, additionalData?: any): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/register', {
      method: 'POST',
      body: JSON.stringify({ 
        firstName, 
        lastName, 
        email, 
        password,
        ...additionalData 
      }),
    });
  }

  async logout(): Promise<void> {
    await this.makeRequest<void>('/logout', {
      method: 'POST',
    });
    
    // Nettoyer le localStorage
    this.clearAuthData();
  }

  async getCurrentUser(): Promise<User> {
    return this.makeRequest<User>('/user');
  }

  // Gestion du token et des données d'auth
  saveAuthData(token: string, user: User): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new Event('storage_change'));
  }

  clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage_change'));
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true' && 
           localStorage.getItem('auth_token') !== null;
  }

  getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Redirection basée sur le rôle
  redirectAfterLogin(user: User): void {
    switch (user.role) {
      case 'admin':
        window.location.hash = '#/admin/dashboard';
        break;
      case 'employee':
        window.location.hash = '#/admin/dashboard';
        break;
      case 'prof':
        window.location.hash = '#/prof/dashboard';
        break;
      default:
        window.location.hash = '#/dashboard';
    }
  }
}

export const authService = new AuthService();