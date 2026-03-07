// Service de gestion des paiements
import { auth } from './auth';

class PaiementService {
  constructor() {
    this.baseURL = '/api/paiements';
  }

  // Valider les données de paiement
  validatePaiementData(formData) {
    const errors = [];

    if (!formData.type_paiement) {
      errors.push('Le type de paiement est obligatoire');
    }

    if (!formData.montant || formData.montant <= 0) {
      errors.push('Le montant doit être supérieur à 0');
    }

    if (!formData.parcours_id) {
      errors.push('Un parcours doit être sélectionné');
    }

    if (formData.type_paiement === 'virement' && !formData.reference_virement) {
      errors.push('La référence de virement est obligatoire');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Créer un nouveau paiement
  async createPaiement(formData, fichier = null) {
    try {
      const token = auth.getToken();
      if (!token) {
        throw new Error('Authentification requise');
      }

      // Simulation de création de paiement
      const mockPaiement = {
        id: Date.now(),
        user_id: auth.getUserData()?.id || 1,
        parcours_id: formData.parcours_id,
        type_paiement: formData.type_paiement,
        montant: parseFloat(formData.montant),
  devise: formData.devise || 'MAD',
        status: 'en_attente',
        reference_virement: formData.reference_virement || null,
        commentaire: formData.commentaire || null,
        date_paiement: new Date().toISOString(),
        created_at: new Date().toISOString(),
        fichier_justificatif: fichier ? {
          nom: fichier.name,
          taille: fichier.size,
          type: fichier.type
        } : null
      };

      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1500));

      return { data: mockPaiement };
    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error);
      throw error;
    }
  }

  // Obtenir les paiements de l'utilisateur
  async getMesPaiements(status = null) {
    try {
      const token = auth.getToken();
      if (!token) {
        throw new Error('Authentification requise');
      }

      // Simulation de données de paiements
      let mockPaiements = [
        {
          id: 1,
          user_id: 1,
          parcours_id: 1,
          type_paiement: 'carte',
          montant: 299.00,
          devise: 'MAD',
          status: 'confirme',
          date_paiement: '2024-01-15T10:30:00Z',
          parcours: {
            nom: 'Découvrir l\'ennéagramme',
            prix: 299
          }
        },
        {
          id: 2,
          user_id: 1,
          parcours_id: 2,
          type_paiement: 'virement',
          montant: 449.00,
          devise: 'MAD',
          status: 'en_attente',
          reference_virement: 'VIR2024001',
          date_paiement: '2024-02-01T14:20:00Z',
          parcours: {
            nom: 'Approfondir sa connaissance',
            prix: 449
          }
        }
      ];

      // Filtrer par status si fourni
      if (status) {
        mockPaiements = mockPaiements.filter(p => p.status === status);
      }

      return { data: mockPaiements };
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error);
      throw error;
    }
  }

  // Télécharger un fichier justificatif
  async downloadFichier(paiementId) {
    try {
      const token = auth.getToken();
      if (!token) {
        throw new Error('Authentification requise');
      }

      // Simulation de téléchargement
      console.log(`Téléchargement du fichier pour le paiement ${paiementId}`);
      
      // Dans un vrai système, cela retournerait une URL de téléchargement
      return { data: { downloadUrl: `/api/paiements/${paiementId}/fichier` } };
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw error;
    }
  }

  // Formatter un montant
  formatMontant(montant, devise = 'MAD') {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise
    });
    return formatter.format(montant);
  }

  // Formatter une date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Obtenir la couleur du status
  getStatusColor(status) {
    const colors = {
      'en_attente': 'text-yellow-600 bg-yellow-50',
      'confirme': 'text-green-600 bg-green-50',
      'refuse': 'text-red-600 bg-red-50',
      'annule': 'text-gray-600 bg-gray-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  }

  // Obtenir le texte du status
  getStatusText(status) {
    const texts = {
      'en_attente': 'En attente',
      'confirme': 'Confirmé',
      'refuse': 'Refusé',
      'annule': 'Annulé'
    };
    return texts[status] || status;
  }

  // Obtenir le texte du type de paiement
  getTypeText(type) {
    const types = {
      'carte': 'Carte bancaire',
      'virement': 'Virement bancaire',
      'paypal': 'PayPal',
      'especes': 'Espèces'
    };
    return types[type] || type;
  }
}

// Créer et exporter l'instance
const paiementService = new PaiementService();
export default paiementService;
