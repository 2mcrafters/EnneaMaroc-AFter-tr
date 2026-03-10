// Service de gestion des parcours
import { auth } from './auth';
import { API_BASE_URL } from '../../services/baseApi';

class ParcoursService {
  constructor() {
    // Use the shared API_BASE_URL but ensure it doesn't have trailing slash if we append /parcours
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    this.baseURL = `${baseUrl}/parcours`;
  }

  // Obtenir tous les parcours
  async getAll() {
    try {
      const response = await fetch(this.baseURL, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch parcours');
      return await response.json();
    } catch (error) {
      console.warn('API non disponible, utilisation des données statiques:', error.message);
      return null;
    }
  }

  // Obtenir un parcours par slug
  async getBySlug(slug) {
    try {
      const response = await fetch(`${this.baseURL}/${slug}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch parcours');
      return await response.json();
    } catch (error) {
      console.warn('API non disponible, utilisation des données statiques:', error.message);
      return null;
    }
  }



  // Obtenir un parcours par ID
  async getById(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch parcours');
      return await response.json();
    } catch (error) {
      console.warn('API non disponible, utilisation des données statiques:', error.message);
      return null;
    }
  }


  // Obtenir les intérêts de l'utilisateur
  async getUserInterests() {
    try {
      const token = auth.getToken();
      if (!token) {
        return { data: [] };
      }

      // Simulation des intérêts utilisateur
      const mockInterests = [
        { id: 1, parcours_id: 1, user_id: 1 },
        { id: 2, parcours_id: 2, user_id: 1 }
      ];

      return { data: mockInterests };
    } catch (error) {
      console.error('Erreur lors de la récupération des intérêts:', error);
      throw error;
    }
  }

  // Ajouter un intérêt pour un parcours
  async addInterest(parcoursId) {
    try {
      const token = auth.getToken();
      if (!token) {
        throw new Error('Authentification requise');
      }

      // Simulation d'ajout d'intérêt
      const mockInterest = {
        id: Date.now(),
        parcours_id: parcoursId,
        user_id: auth.getUserData()?.id || 1,
        created_at: new Date().toISOString()
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      return { data: mockInterest };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'intérêt:', error);
      throw error;
    }
  }

  // Supprimer un intérêt pour un parcours
  async removeInterest(parcoursId) {
    try {
      const token = auth.getToken();
      if (!token) {
        throw new Error('Authentification requise');
      }

      // Simulation de suppression d'intérêt
      await new Promise(resolve => setTimeout(resolve, 500));

      return { data: { success: true } };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'intérêt:', error);
      throw error;
    }
  }

  // Vérifier si l'utilisateur est intéressé par un parcours
  async isUserInterested(parcoursId) {
    try {
      const interests = await this.getUserInterests();
      return interests.data.some(interest => interest.parcours_id === parcoursId);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'intérêt:', error);
      return false;
    }
  }

  // Rechercher des parcours
  async search(query) {
    try {
      const allParcours = await this.getAll();
      if (!allParcours) return { data: [] };
      const filteredParcours = allParcours.data.filter(parcours =>
        parcours.titre.toLowerCase().includes(query.toLowerCase()) ||
        parcours.description.toLowerCase().includes(query.toLowerCase())
      );

      return { data: filteredParcours };
    } catch (error) {
      console.warn('Erreur lors de la recherche:', error.message);
      return { data: [] };
    }
  }
}

// Créer et exporter l'instance
export const parcoursService = new ParcoursService();
export default parcoursService;
