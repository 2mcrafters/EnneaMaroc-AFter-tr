// Service pour gérer les appels API
// Read base URL from Vite env (VITE_API_BASE_URL) with fallback for local dev.
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface LoginResponse {
  user: any;
  token: string;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

interface UploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  message?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  private getUploadHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  async register(userData: any): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  async uploadProfilePicture(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('profile_picture', file);

    const response = await fetch(`${API_BASE_URL}/upload/profile-picture`, {
      method: 'POST',
      headers: this.getUploadHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  }

  async getUser(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/user`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  }

  // Générer une URL d'avatar par défaut basée sur le nom
  generateAvatarUrl(firstName: string, lastName: string, email: string): string {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    // Utiliser DiceBear API pour générer un avatar avec les initiales
    return `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=86efac&textColor=166534`;
  }

  // Créer un nouveau paiement
  async createPayment(paymentData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to create payment');
    }

    return response.json();
  }

  // Mettre à jour un paiement existant
  async updatePayment(paymentId: number, paymentData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to update payment');
    }

    return response.json();
  }

  // Mettre à jour le statut d'une inscription
  async updateEnrollmentStatus(enrollmentId: number, status: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to update enrollment status');
    }

    return response.json();
  }

  // Mettre à jour le statut de paiement des frais d'inscription
  async updateRegistrationFeeStatus(userId: number, hasPaid: boolean): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/registration-fee`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ has_paid_registration_fee: hasPaid }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to update registration fee status');
    }

    return response.json();
  }

  // Confirmer un paiement (changer son statut à 'confirmed')
  async confirmPayment(paymentId: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/confirm`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to confirm payment');
    }

    return response.json();
  }
}

export const apiService = new ApiService();