// Service simplifié pour la gestion des départements
import { DEFAULT_DEPARTMENTS, PERMISSIONS } from '../types/departments';
import type { 
  Department, 
  DepartmentFunction, 
  DepartmentWithFunctions,
  CreateDepartmentData,
  CreateFunctionData
} from '../types/departments';

// Service simulé pour le développement
class DepartmentService {
  private departments: Department[] = [];
  private functions: DepartmentFunction[] = [];
  private nextId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialiser avec des départements par défaut
    DEFAULT_DEPARTMENTS.forEach((dept, index) => {
      this.departments.push({
        ...dept,
        id: index + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    // Ajouter quelques fonctions par défaut
    this.functions = [
      {
        id: 1,
        name: 'Gestion des Cours',
        description: 'Créer, modifier et supprimer des cours',
        department_id: 2, // Pédagogie
        permissions: [PERMISSIONS.COURSES_VIEW, PERMISSIONS.COURSES_CREATE, PERMISSIONS.COURSES_EDIT],
        route: '#/admin/courses',
        icon: '📚',
        isActive: true,
        order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Gestion des Utilisateurs',
        description: 'Gérer les étudiants et professeurs',
        department_id: 1, // Administration
        permissions: [PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_EDIT],
        route: '#/admin/students',
        icon: '👥',
        isActive: true,
        order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        name: 'Gestion des Paiements',
        description: 'Suivre et gérer les paiements',
        department_id: 3, // Finance
        permissions: [PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_MANAGE],
        route: '#/admin/payments',
        icon: '💰',
        isActive: true,
        order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },

      {
        id: 5,
        name: 'Tableau de Bord',
        description: 'Vue d\'ensemble des statistiques',
        department_id: 1, // Administration
        permissions: [PERMISSIONS.ADMIN_DASHBOARD],
        route: '#/admin/dashboard',
        icon: '📊',
        isActive: true,
        order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    this.nextId = Math.max(...this.departments.map(d => d.id), ...this.functions.map(f => f.id)) + 1;
  }

  // Méthodes pour les départements
  async getAllDepartments(): Promise<Department[]> {
    return Promise.resolve([...this.departments]);
  }

  async getDepartmentById(id: number): Promise<DepartmentWithFunctions> {
    const department = this.departments.find(d => d.id === id);
    if (!department) {
      throw new Error(`Department with id ${id} not found`);
    }

    const functions = this.functions.filter(f => f.department_id === id);
    return Promise.resolve({
      ...department,
      functions: functions.sort((a, b) => a.order - b.order)
    });
  }

  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    const newDepartment: Department = {
      id: this.nextId++,
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      isActive: data.isActive ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.departments.push(newDepartment);
    return Promise.resolve(newDepartment);
  }

  // Méthodes pour les fonctions
  async getFunctionsByDepartment(departmentId: number): Promise<DepartmentFunction[]> {
    const functions = this.functions.filter(f => f.department_id === departmentId);
    return Promise.resolve(functions.sort((a, b) => a.order - b.order));
  }

  async createFunction(data: CreateFunctionData): Promise<DepartmentFunction> {
    const newFunction: DepartmentFunction = {
      id: this.nextId++,
      name: data.name,
      description: data.description,
      department_id: data.department_id,
      permissions: data.permissions,
      route: data.route,
      icon: data.icon,
      isActive: data.isActive ?? true,
      order: data.order ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.functions.push(newFunction);
    return Promise.resolve(newFunction);
  }

  // Méthodes utilitaires
  async getDepartmentsByUserRole(userRole: string): Promise<DepartmentWithFunctions[]> {
    const accessibleDepartments: DepartmentWithFunctions[] = [];

    for (const dept of this.departments) {
      if (!dept.isActive) continue;

      const departmentFunctions = this.functions.filter(f => 
        f.department_id === dept.id && 
        f.isActive &&
        this.hasRoleAccess(userRole, f.permissions)
      );

      if (departmentFunctions.length > 0) {
        accessibleDepartments.push({
          ...dept,
          functions: departmentFunctions.sort((a, b) => a.order - b.order)
        });
      }
    }

    return Promise.resolve(accessibleDepartments);
  }

  private hasRoleAccess(userRole: string, requiredPermissions: string[]): boolean {
    // Logique simplifiée basée sur le rôle
    switch (userRole) {
      case 'admin':
        return true; // Admin a accès à tout
      case 'employee':
        // Employee a accès à la plupart des fonctions sauf administration système
        return !requiredPermissions.includes(PERMISSIONS.ADMIN_SETTINGS);
      case 'prof':
        // Prof a accès aux fonctions pédagogiques
        return requiredPermissions.some(p => 
          p.includes('courses') || p === PERMISSIONS.ADMIN_DASHBOARD
        );
      case 'student':
        // Student n'a pas accès aux fonctions d'administration
        return false;
      default:
        return false;
    }
  }

  // Obtenir les fonctions accessibles pour un utilisateur
  async getUserAccessibleFunctions(userRole: string): Promise<DepartmentFunction[]> {
    return Promise.resolve(
      this.functions.filter(f => 
        f.isActive && this.hasRoleAccess(userRole, f.permissions)
      ).sort((a, b) => a.order - b.order)
    );
  }
}

export const departmentService = new DepartmentService();