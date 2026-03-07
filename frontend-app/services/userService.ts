// Service de gestion des utilisateurs (CRUD)
import { BaseApiService } from './baseApi';
import { User } from './authService';

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dob?: string;
  city?: string;
  phone?: string;
  profilePicture?: string;
  role?: 'admin' | 'employee' | 'prof' | 'student';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  dob?: string;
  city?: string;
  phone?: string;
  profilePicture?: string;
  role?: 'admin' | 'employee' | 'prof' | 'student';
}

export interface RegisterResponse {
  user: User;
  token: string;
}

class UserService extends BaseApiService {
  // Inscription (register)
  async register(userData: CreateUserData): Promise<RegisterResponse> {
    // Si pas de photo, générer un avatar par défaut
    if (!userData.profilePicture && userData.firstName && userData.lastName) {
      userData.profilePicture = this.generateDefaultAvatar(
        userData.firstName, 
        userData.lastName
      );
    }

    return this.makeRequest<RegisterResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Créer un utilisateur (admin only)
  async createUser(userData: CreateUserData): Promise<User> {
    if (!userData.profilePicture && userData.firstName && userData.lastName) {
      userData.profilePicture = this.generateDefaultAvatar(
        userData.firstName, 
        userData.lastName
      );
    }

    return this.makeRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Récupérer tous les utilisateurs (admin/employee only)
  async getAllUsers(): Promise<User[]> {
    return this.makeRequest<User[]>('/users');
  }

  // Récupérer un utilisateur par ID
  async getUserById(id: number): Promise<User> {
    return this.makeRequest<User>(`/users/${id}`);
  }

  // Mettre à jour un utilisateur
  async updateUser(id: number, userData: UpdateUserData): Promise<User> {
    return this.makeRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Mettre à jour le profil de l'utilisateur connecté
  async updateProfile(userData: UpdateUserData): Promise<{ user: User; message: string }> {
    return this.makeRequest<{ user: User; message: string }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Supprimer un utilisateur
  async deleteUser(id: number): Promise<void> {
    return this.makeRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Changer le mot de passe
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.makeRequest<void>('/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword,
      }),
    });
  }

  // Changer l'email
  async updateEmail(currentPassword: string, newEmail: string): Promise<{ user: User; message: string }> {
    return this.makeRequest<{ user: User; message: string }>('/user/email', {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newEmail,
      }),
    });
  }

  // Changer le mot de passe utilisateur (nouvelle méthode)
  async updatePassword(currentPassword: string, newPassword: string, newPasswordConfirmation: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/user/password', {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newPassword,
        newPassword_confirmation: newPasswordConfirmation,
      }),
    });
  }

  // Changer la photo de profil
  async updateProfilePicture(file: File): Promise<{ user: User; message: string }> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return this.makeUploadRequest<{ user: User; message: string }>('/user/profile-picture', formData);
  }

  // Rechercher des utilisateurs
  async searchUsers(query: string, role?: string): Promise<User[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (role) params.append('role', role);

    return this.makeRequest<User[]>(`/users/search?${params.toString()}`);
  }

  // Générer un avatar par défaut avec initiales
  generateDefaultAvatar(firstName: string, lastName: string): string {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=86efac&textColor=166534`;
  }

  // Récupérer les statistiques des utilisateurs (admin only)
  async getUserStats(): Promise<{
    total: number;
    students: number;
    profs: number;
    employees: number;
    admins: number;
  }> {
    return this.makeRequest('/users/stats');
  }
}

export const userService = new UserService();