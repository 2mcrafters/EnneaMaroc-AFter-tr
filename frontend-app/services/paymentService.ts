import { BaseApiService } from './baseApi';

export type PaymentStatus = 'pending' | 'confirmed' | 'rejected';

export interface Payment {
  id: number;
  enrollment_id: number;
  amount: number;
  month: number;
  status: PaymentStatus;
  payment_proof?: string;
  confirmed_by?: number;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
  // Relations
  enrollment?: {
    id: number;
    user_id: number;
    course_id?: number;
    status: string;
    user?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
    course?: {
      id: number;
      title: string;
      price?: string;
    };
    session?: {
      id: number;
      start_date: string;
      module?: {
        id: number;
        title: string;
        price?: string;
        parcours?: {
          id: number;
          title: string;
        };
      };
    };
  };
  confirmed_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface CreatePaymentData {
  // Either enrollment_id (legacy) OR user_id + course_id (manual admin flow)
  enrollment_id?: number;
  user_id?: number;
  course_id?: number;
  amount: number;
  month: number;
  payment_date?: string; // YYYY-MM-DD
  payment_proof?: string;
  status?: PaymentStatus;
  admin_notes?: string;
}

export interface UpdatePaymentData {
  enrollment_id?: number;
  month?: number;
  status?: PaymentStatus;
  payment_proof?: string;
}

export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  confirmed_payments: number;
  confirmed_amount: number;
  pending_payments: number;
  pending_amount: number;
  rejected_payments: number;
  rejected_amount: number;
  monthly_stats: Array<{
    month: number;
    year: number;
    payments_count: number;
    total_amount: number;
  }>;
}

class PaymentService extends BaseApiService {
  // Récupérer tous les paiements
  async getAllPayments(): Promise<Payment[]> {
    const response = await this.makeRequest<any>('/payments');
    // Possible shapes: { payments: [...] }, { data: { data: [...]} } (paginator), { data: [...] }
    if (Array.isArray(response)) return response as Payment[];
    if (Array.isArray(response?.payments)) return response.payments as Payment[];
    if (Array.isArray(response?.data?.data)) return response.data.data as Payment[]; // Laravel pagination
    if (Array.isArray(response?.data)) return response.data as Payment[];
    // Handle success wrapper
    if (response?.success && Array.isArray(response?.data?.data)) return response.data.data as Payment[];
    if (response?.success && Array.isArray(response?.data)) return response.data as Payment[];
    return [];
  }

  // Récupérer les paiements d'une inscription
  async getEnrollmentPayments(enrollmentId: number): Promise<Payment[]> {
    const response = await this.makeRequest<any>(`/enrollments/${enrollmentId}/payments`);
    if (Array.isArray(response)) return response as Payment[];
    if (Array.isArray(response?.payments)) return response.payments as Payment[];
    if (Array.isArray(response?.data?.data)) return response.data.data as Payment[];
    if (Array.isArray(response?.data)) return response.data as Payment[];
    // Handle success wrapper
    if (response?.success && Array.isArray(response?.data?.data)) return response.data.data as Payment[];
    if (response?.success && Array.isArray(response?.data)) return response.data as Payment[];
    return [];
  }

  // Récupérer les paiements d'un utilisateur
  async getUserPayments(userId: number): Promise<Payment[]> {
    // Stratégie progressive: essayer plusieurs endpoints
    const candidateEndpoints = [
      `/users/${userId}/payments`,            // prévu initialement (format {success: true, payments: [...], count: n})
      `/payments/user/${userId}`,             // alternative possible
      `/payments?user_id=${userId}`           // filtre query si supporté côté backend
    ];

    for (const ep of candidateEndpoints) {
      try {
        const resp = await this.makeRequest<any>(ep);
        
        console.log(`[PaymentService] getUserPayments response from ${ep}:`, resp);
        
        // Gérer le format spécifique {success: true, payments: [...], count: n}
        if (resp?.success === true && resp?.payments && Array.isArray(resp.payments)) {
          console.log(`[PaymentService] Found payments in success/payments format: ${resp.payments.length} items`);
          return resp.payments as Payment[];
        }
        
        // Autres formats possibles
        if (Array.isArray(resp)) {
          console.log(`[PaymentService] Found payments as direct array: ${resp.length} items`);
          return resp as Payment[];
        }
        
        if (resp?.data && Array.isArray(resp.data)) {
          console.log(`[PaymentService] Found payments in data format: ${resp.data.length} items`);
          return resp.data as Payment[];
        }
      } catch (e: any) {
        // Si 404 on essaie endpoint suivant, sinon on stoppe immédiatement
        console.error(`[PaymentService] Error fetching from ${ep}:`, e);
        if (!String(e?.message || '').includes('could not be found') && e.status !== 404) {
          throw e;
        }
      }
    }

    // Fallback final: charger tous les paiements et filtrer côté client
    try {
      console.log(`[PaymentService] Trying fallback: get all payments and filter`);
      const all = await this.getAllPayments();
      const filtered = all.filter(p => p.enrollment?.user_id === userId || p.enrollment_id === userId);
      console.log(`[PaymentService] Fallback found ${filtered.length} payments for user ${userId}`);
      return filtered;
    } catch (e) {
      console.error(`[PaymentService] Complete failure getting user payments:`, e);
      throw new Error(`Unable to retrieve user payments: missing backend route. Add one of: GET /users/{id}/payments, GET /payments/user/{id} or support ?user_id= filter.`);
    }
  }

  // Récupérer un paiement spécifique
  private extractPayment(resp: any): Payment {
    // Accept { payment }, { data }, or direct object
    if (resp?.payment) return resp.payment as Payment;
    if (resp?.data && !Array.isArray(resp.data)) return resp.data as Payment;
    return resp as Payment;
  }

  async getPayment(id: number): Promise<Payment> {
    const response = await this.makeRequest<any>(`/payments/${id}`);
    return this.extractPayment(response);
  }

  // Créer un nouveau paiement
  async createPayment(data: CreatePaymentData): Promise<Payment> {
    const payload: CreatePaymentData = { ...data };
    // Auto-fill payment_date if absent (today)
    if (!payload.payment_date) {
      const d = new Date();
      payload.payment_date = d.toISOString().slice(0,10); // YYYY-MM-DD
    }
    // Debug: ensure payment_date present
    // Remove after verification
    console.debug('[createPayment] payload being sent', payload);
    const response = await this.makeRequest<any>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return this.extractPayment(response);
  }

  // Mettre à jour un paiement
  async updatePayment(id: number, data: UpdatePaymentData): Promise<Payment> {
    const response = await this.makeRequest<any>(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return this.extractPayment(response);
  }

  // Supprimer un paiement
  async deletePayment(id: number): Promise<void> {
    await this.makeRequest(`/payments/${id}`, { method: 'DELETE' });
  }

  // Confirmer un paiement (admin only)
  async confirmPayment(id: number): Promise<Payment> {
    const response = await this.makeRequest<any>(`/payments/${id}/confirm`, { method: 'POST' });
    return this.extractPayment(response);
  }

  // Rejeter un paiement (admin only)
  async rejectPayment(id: number): Promise<Payment> {
    const response = await this.makeRequest<any>(`/payments/${id}/reject`, { method: 'POST' });
    return this.extractPayment(response);
  }

  // Obtenir les statistiques des paiements (admin only)
  async getPaymentStats(): Promise<PaymentStats> {
    const response = await this.makeRequest<PaymentStats>('/payments/stats');
    return response;
  }

  // Méthodes helper pour créer des paiements mensuels
  async createMonthlyPayment(enrollmentId: number, month: number, amount: number, proof?: string): Promise<Payment> {
    return this.createPayment({
      enrollment_id: enrollmentId,
      month,
      amount,
      payment_proof: proof,
    });
  }

  // Créer le premier paiement d'une inscription (avec frais d'inscription si nécessaire)
  async createFirstPayment(enrollmentId: number, baseAmount: number, hasRegistrationFee: boolean = false, proof?: string): Promise<Payment> {
    const REGISTRATION_FEE = 250;
    const totalAmount = baseAmount + (hasRegistrationFee ? REGISTRATION_FEE : 0);
    
    return this.createPayment({
      enrollment_id: enrollmentId,
      month: 1,
      amount: totalAmount,
      payment_proof: proof,
    });
  }

  // Filtrer les paiements par statut
  async getPaymentsByStatus(status: PaymentStatus): Promise<Payment[]> {
    const allPayments = await this.getAllPayments();
    return allPayments.filter(payment => payment.status === status);
  }

  // Obtenir les paiements en attente (pour les admins)
  async getPendingPayments(): Promise<Payment[]> {
    return this.getPaymentsByStatus('pending');
  }

  // Obtenir les paiements confirmés
  async getConfirmedPayments(): Promise<Payment[]> {
    return this.getPaymentsByStatus('confirmed');
  }

  // Obtenir les paiements rejetés
  async getRejectedPayments(): Promise<Payment[]> {
    return this.getPaymentsByStatus('rejected');
  }

  // Uploader une preuve de paiement
  async uploadPaymentProof(paymentId: number, file: File): Promise<Payment> {
    const formData = new FormData();
    formData.append('payment_proof', file);

    const response = await this.makeUploadRequest<any>(`/payments/${paymentId}/upload-proof`, formData);
    return this.extractPayment(response);
  }
}

export const paymentService = new PaymentService();
export default paymentService;