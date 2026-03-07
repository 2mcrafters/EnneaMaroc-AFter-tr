import { BaseApiService } from './baseApi';

export type BonDeCommande = 'oui' | 'non';

export interface ConfirmationEmailPayload {
  user_id: number;
  course_id: number;
  group_id: number;
  course_title?: string;
  group_title?: string;
  monthly_amount?: number;
  duration_months?: number;

  nom: string;
  prenom: string;
  adresse?: string;
  telephone_personnel?: string;
  email: string;
  diplome_obtenu?: string;
  profession_exercee?: string;

  entreprise?: string;
  is_entreprise?: boolean;
  bon_de_commande?: BonDeCommande;
  adresse_facturation?: string;
  contact_dossier?: string;
  telephone_contact?: string;
  email_contact?: string;

  accept_conditions: boolean;
}

class ConfirmationService extends BaseApiService {
  async sendEnrollmentConfirmationEmail(payload: ConfirmationEmailPayload): Promise<void> {
    await this.makeRequest('/enrollments/confirmation-email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const confirmationService = new ConfirmationService();
