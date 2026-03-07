// Types et interfaces pour la gestion des départements

export interface Department {
  id: number;
  name: string;
  description: string;
  color: string; // Couleur pour l'affichage
  icon?: string; // Icône du département
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentFunction {
  id: number;
  name: string;
  description: string;
  department_id: number;
  permissions: string[]; // Liste des permissions requises
  route?: string; // Route frontend associée
  icon?: string;
  isActive: boolean;
  order: number; // Ordre d'affichage
  created_at: string;
  updated_at: string;
}

export interface UserDepartmentRole {
  id: number;
  user_id: number;
  department_id: number;
  role: 'manager' | 'employee' | 'viewer';
  functions: number[]; // IDs des fonctions accessibles
  assigned_at: string;
  assigned_by: number;
}

export interface DepartmentWithFunctions extends Department {
  functions: DepartmentFunction[];
  userRole?: UserDepartmentRole;
}

// Filtres pour les départements
export interface DepartmentFilters {
  isActive?: boolean;
  search?: string;
  hasUserAccess?: boolean;
}

// Filtres pour les fonctions
export interface FunctionFilters {
  department_id?: number;
  isActive?: boolean;
  search?: string;
  userHasAccess?: boolean;
}

// Données pour créer/modifier un département
export interface CreateDepartmentData {
  name: string;
  description: string;
  color: string;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentData extends Partial<CreateDepartmentData> {
  id: number;
}

// Données pour créer/modifier une fonction
export interface CreateFunctionData {
  name: string;
  description: string;
  department_id: number;
  permissions: string[];
  route?: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateFunctionData extends Partial<CreateFunctionData> {
  id: number;
}

// Données pour assigner un utilisateur à un département
export interface AssignUserToDepartmentData {
  user_id: number;
  department_id: number;
  role: 'manager' | 'employee' | 'viewer';
  functions: number[];
}

// État du store Redux pour les départements
export interface DepartmentsState {
  departments: Department[];
  functions: DepartmentFunction[];
  userRoles: UserDepartmentRole[];
  selectedDepartment: DepartmentWithFunctions | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  filters: DepartmentFilters;
  functionFilters: FunctionFilters;
}

// Permissions prédéfinies pour les fonctions
export const PERMISSIONS = {
  // Gestion des cours
  COURSES_VIEW: 'courses.view',
  COURSES_CREATE: 'courses.create',
  COURSES_EDIT: 'courses.edit',
  COURSES_DELETE: 'courses.delete',
  
  // Gestion des utilisateurs
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  

  // Gestion des paiements
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_MANAGE: 'payments.manage',
  
  // Administration système
  ADMIN_DASHBOARD: 'admin.dashboard',
  ADMIN_SETTINGS: 'admin.settings',
  
  // Rapports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Départements prédéfinis
export const DEFAULT_DEPARTMENTS: Omit<Department, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Administration',
    description: 'Gestion générale de l\'établissement',
    color: '#3B82F6', // Bleu
    icon: '🏛️',
    isActive: true,
  },
  {
    name: 'Pédagogie',
    description: 'Gestion des cours et des programmes',
    color: '#10B981', // Vert
    icon: '📚',
    isActive: true,
  },
  {
    name: 'Finance',
    description: 'Gestion des finances et paiements',
    color: '#F59E0B', // Jaune/Orange
    icon: '💰',
    isActive: true,
  },
  {
    name: 'Ressources Humaines',
    description: 'Gestion du personnel',
    color: '#8B5CF6', // Violet
    icon: '👥',
    isActive: true,
  },
  {
    name: 'Support Technique',
    description: 'Support informatique et technique',
    color: '#EF4444', // Rouge
    icon: '🔧',
    isActive: true,
  },
];