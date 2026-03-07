// Point d'entrée centralisé pour tous les services API
import { User } from './authService';

export { BaseApiService } from './baseApi';
export { authService, type User, type LoginResponse } from './authService';
export { userService, type CreateUserData, type UpdateUserData } from './userService';
export { fileService, type UploadResponse, type DeleteFileResponse } from './fileService';
export { courseService, type Course, type CreateCourseData, type UpdateCourseData } from './courseService';
export { parcoursService, type Parcours, type ParcoursModule } from './parcoursService';

// Configuration globale des services
export const API_CONFIG = {
  BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api',
  TIMEOUT: 10000,
  STORAGE_KEY: 'auth_token',
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper pour mettre à jour la configuration de tous les services
export const updateApiConfig = (config: Partial<typeof API_CONFIG>) => {
  Object.assign(API_CONFIG, config);
  // Vous pouvez ici ajouter une logique pour propager les changements aux services
};

// Type guards utiles
export const isApiError = (error: any): error is { message: string; status?: number } => {
  return error && typeof error.message === 'string';
};

// Utilitaires pour la gestion des erreurs
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper pour formater les erreurs API
export const formatApiError = (error: any): string => {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Une erreur inattendue s\'est produite';
};

// Helper pour vérifier si l'utilisateur est connecté
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(API_CONFIG.STORAGE_KEY);
  return !!token;
};

// Helper pour récupérer l'utilisateur actuel
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
};

// Helper pour la déconnexion complète
export const logout = async (): Promise<void> => {
  localStorage.removeItem(API_CONFIG.STORAGE_KEY);
  localStorage.removeItem('currentUser');
};

// Types utilitaires
export type ApiResponse<T> = T;
export type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

// Constants pour les rôles
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  PROF: 'prof',
  STUDENT: 'student',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Helper pour vérifier les permissions
export const hasRole = (requiredRole: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.role === requiredRole;
};

export const hasAnyRole = (requiredRoles: UserRole[]): boolean => {
  const user = getCurrentUser();
  return user ? requiredRoles.includes(user.role as UserRole) : false;
};

// Helper pour les rôles d'administration
export const isAdmin = (): boolean => hasRole(USER_ROLES.ADMIN);
export const isEmployee = (): boolean => hasRole(USER_ROLES.EMPLOYEE);
export const isProf = (): boolean => hasRole(USER_ROLES.PROF);
export const isStudent = (): boolean => hasRole(USER_ROLES.STUDENT);

// Helper pour les permissions hiérarchiques
export const canManageUsers = (): boolean => {
  return hasAnyRole([USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]);
};

export const canManageCourses = (): boolean => {
  return hasAnyRole([USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE, USER_ROLES.PROF]);
};

export const canViewReports = (): boolean => {
  return hasAnyRole([USER_ROLES.ADMIN, USER_ROLES.EMPLOYEE]);
};