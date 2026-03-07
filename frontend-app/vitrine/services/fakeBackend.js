// Service de simulation de backend pour les fonctionnalités administratives
import { auth } from './auth';

class FakeBackend {
  constructor() {
    this.users = [];
    this.permissions = [];
    this.stats = {};
  }

  // Obtenir les statistiques utilisateurs
  async getUserStats() {
    try {
      const token = auth.getToken();
      if (!token || !await auth.isAdmin()) {
        throw new Error('Accès administrateur requis');
      }

      // Simulation de statistiques
      const mockStats = {
        totalUsers: 156,
        activeUsers: 142,
        newUsersThisMonth: 23,
        usersByType: {
          debutant: 89,
          intermediaire: 45,
          expert: 22
        },
        registrationTrend: [
          { month: 'Jan', count: 12 },
          { month: 'Fév', count: 18 },
          { month: 'Mar', count: 23 },
          { month: 'Avr', count: 15 },
          { month: 'Mai', count: 28 }
        ]
      };

      return { data: mockStats };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Obtenir la liste des utilisateurs (admin)
  async getUsers(page = 1, limit = 10) {
    try {
      const token = auth.getToken();
      if (!token || !await auth.isAdmin()) {
        throw new Error('Accès administrateur requis');
      }

      // Simulation de liste d'utilisateurs
      const mockUsers = [
        {
          id: 1,
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@email.com',
          type: 'debutant',
          dateInscription: '2024-01-15',
          derniereConnexion: '2024-02-20',
          actif: true
        },
        {
          id: 2,
          nom: 'Martin',
          prenom: 'Marie',
          email: 'marie.martin@email.com',
          type: 'intermediaire',
          dateInscription: '2024-02-01',
          derniereConnexion: '2024-02-22',
          actif: true
        }
      ];

      return { 
        data: mockUsers,
        total: mockUsers.length,
        page,
        limit
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  // Vérifier les permissions d'un utilisateur
  async checkPermission(userId, permission) {
    try {
      const token = auth.getToken();
      if (!token) {
        return false;
      }

      // Simulation de vérification de permissions
      const userPermissions = ['read', 'write'];
      return userPermissions.includes(permission);
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }

  // Mettre à jour le statut d'un utilisateur
  async updateUserStatus(userId, actif) {
    try {
      const token = auth.getToken();
      if (!token || !await auth.isAdmin()) {
        throw new Error('Accès administrateur requis');
      }

      // Simulation de mise à jour
      await new Promise(resolve => setTimeout(resolve, 500));

      return { data: { success: true, userId, actif } };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut utilisateur:', error);
      throw error;
    }
  }

  // Obtenir les paramètres système
  async getSystemSettings() {
    try {
      const token = auth.getToken();
      if (!token || !await auth.isAdmin()) {
        throw new Error('Accès administrateur requis');
      }

      const mockSettings = {
        siteName: 'Ennéagramme Maroc',
        siteDescription: 'Formation et coaching en ennéagramme',
        maintenanceMode: false,
        allowRegistration: true,
        emailNotifications: true
      };

      return { data: mockSettings };
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      throw error;
    }
  }
}

// Créer et exporter l'instance
const fakeBackend = new FakeBackend();
export default fakeBackend;
