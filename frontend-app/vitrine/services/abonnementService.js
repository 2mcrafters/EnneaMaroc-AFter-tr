// Service de gestion des abonnements
import { auth } from './auth';

class AbonnementService {
  constructor() {
    this.baseURL = '/api/abonnements';
  }

  // Obtenir les abonnements de l'utilisateur connecté
  async getMySubscriptions() {
    try {
      const token = auth.getToken();
      if (!token) {
        return { data: [] };
      }

      // Simulation de données pour le développement
      const mockSubscriptions = [
        {
          id: 1,
          parcours_id: 1,
          user_id: 1,
          status: 'active',
          created_at: new Date().toISOString(),
          parcours: {
            id: 1,
            titre: 'Découvrir l\'ennéagramme',
            description: 'Formation initiale à l\'ennéagramme'
          }
        }
      ];

      return { data: mockSubscriptions };
    } catch (error) {
      console.error('Erreur lors de la récupération des abonnements:', error);
      throw error;
    }
  }

  // Créer un nouvel abonnement
  async create(abonnementData) {
    try {
      const token = auth.getToken();
      if (!token) {
        throw new Error('Authentification requise');
      }

      // Simulation de création d'abonnement
      const mockAbonnement = {
        id: Date.now(),
        parcours_id: abonnementData.parcours_id,
        user_id: auth.getUserData()?.id || 1,
        methode_paiement: abonnementData.methode_paiement || 'stripe',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { data: mockAbonnement };
    } catch (error) {
      console.error('Erreur lors de la création de l\'abonnement:', error);
      throw error;
    }
  }

  // Mettre à jour un abonnement
  async update(id, updateData) {
    try {
      const token = auth.getToken();
      if (!token) {
        throw new Error('Authentification requise');
      }

      // Simulation de mise à jour
      const mockUpdatedAbonnement = {
        id,
        ...updateData,
        updated_at: new Date().toISOString()
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      return { data: mockUpdatedAbonnement };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
      throw error;
    }
  }

  // Annuler un abonnement
  async cancel(id) {
    try {
      const token = auth.getToken();
      if (!token) {
        throw new Error('Authentification requise');
      }

      // Simulation d'annulation
      await new Promise(resolve => setTimeout(resolve, 500));

      return { data: { id, status: 'cancelled' } };
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
      throw error;
    }
  }

  // Obtenir un abonnement par ID
  async getById(id) {
    try {
      const token = auth.getToken();
      if (!token) {
        throw new Error('Authentification requise');
      }

      // Simulation de récupération par ID
      const mockAbonnement = {
        id,
        parcours_id: 1,
        user_id: auth.getUserData()?.id || 1,
        status: 'active',
        created_at: new Date().toISOString()
      };

      return { data: mockAbonnement };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error);
      throw error;
    }
  }

  // Vérifier si l'utilisateur a un abonnement actif pour un parcours
  async hasActiveSubscription(parcoursId) {
    try {
      const subscriptions = await this.getMySubscriptions();
      return subscriptions.data.some(sub => 
        sub.parcours_id === parcoursId && sub.status === 'active'
      );
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'abonnement:', error);
      return false;
    }
  }
}

// Créer et exporter l'instance
export const abonnementService = new AbonnementService();
export default abonnementService;
