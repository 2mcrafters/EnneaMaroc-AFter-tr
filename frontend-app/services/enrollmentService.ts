import { BaseApiService } from './baseApi';

export type EnrollmentStatus = 'pending_payment' | 'pending_confirmation' | 'active' | 'cancelled' | 'completed';

export interface Enrollment {
  id: number;
  user_id: number;
  course_id?: number;
  status: EnrollmentStatus;
  enrolled_at: string;
  group_id?: number;       // ID du groupe (cours)
  created_at: string;
  updated_at: string;
  // Relations
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture?: string;
  };
  course?: any;
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
  // Attribut virtuel généré à partir de group_id
  group_data?: any;
}

export interface CreateEnrollmentData {
  user_id: number;
  course_id?: number;
  status?: EnrollmentStatus;
  group_id: number;        // Obligatoire maintenant
}

export interface UpdateEnrollmentData {
  status?: EnrollmentStatus;
  group_id?: number;       // ID du groupe (cours) ou modalité (révision)
}

class EnrollmentService extends BaseApiService {
  // Récupérer toutes les inscriptions
  async getAllEnrollments(): Promise<Enrollment[]> {
    const response = await this.makeRequest<any>('/enrollments');
    // Handle different response shapes
    if (Array.isArray(response)) return response as Enrollment[];
    if (Array.isArray(response?.enrollments)) return response.enrollments as Enrollment[];
    if (Array.isArray(response?.data?.data)) return response.data.data as Enrollment[]; // Laravel pagination
    if (Array.isArray(response?.data)) return response.data as Enrollment[];
    // Handle success wrapper
    if (response?.success && Array.isArray(response?.data?.data)) return response.data.data as Enrollment[];
    if (response?.success && Array.isArray(response?.data)) return response.data as Enrollment[];
    return [];
  }

  // Récupérer les inscriptions d'un utilisateur
  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    const response = await this.makeRequest<any>(`/users/${userId}/enrollments`);
    console.log(`[enrollmentService] getUserEnrollments(${userId}) response:`, response);
    // Handle different response shapes
    if (Array.isArray(response)) return response as Enrollment[];
    if (Array.isArray(response?.enrollments)) return response.enrollments as Enrollment[];
    if (Array.isArray(response?.data?.data)) return response.data.data as Enrollment[]; // Laravel pagination
    if (Array.isArray(response?.data)) return response.data as Enrollment[];
    // Handle success wrapper
    if (response?.success && Array.isArray(response?.data?.data)) return response.data.data as Enrollment[];
    if (response?.success && Array.isArray(response?.data)) return response.data as Enrollment[];
    console.warn(`[enrollmentService] Unexpected response format for getUserEnrollments(${userId}):`, response);
    return [];
  }

  // Récupérer les inscriptions pour un cours
  async getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
    const response = await this.makeRequest<any>(`/courses/${courseId}/enrollments`);
    // Handle different response shapes
    if (Array.isArray(response)) return response as Enrollment[];
    if (Array.isArray(response?.enrollments)) return response.enrollments as Enrollment[];
    if (Array.isArray(response?.data?.data)) return response.data.data as Enrollment[];
    if (Array.isArray(response?.data)) return response.data as Enrollment[];
    if (response?.success && Array.isArray(response?.data?.data)) return response.data.data as Enrollment[];
    if (response?.success && Array.isArray(response?.data)) return response.data as Enrollment[];
    return [];
  }



  // Créer une nouvelle inscription
  async createEnrollment(data: CreateEnrollmentData): Promise<Enrollment> {
    const response = await this.makeRequest<any>('/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Backend actuel renvoie { success, data: enrollment } tandis que le service attendait { enrollment }
    const enrollment: Enrollment | undefined = response?.enrollment || response?.data;
    if (!enrollment) {
      throw new Error('Enrollment creation: malformed response');
    }
    return enrollment;
  }

  // Mettre à jour une inscription
  async updateEnrollment(id: number, data: UpdateEnrollmentData): Promise<Enrollment> {
    const response = await this.makeRequest<{ enrollment: Enrollment }>(`/enrollments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.enrollment;
  }

  // Supprimer une inscription
  async deleteEnrollment(id: number): Promise<void> {
    await this.makeRequest(`/enrollments/${id}`, {
      method: 'DELETE',
    });
  }

  // Inscrire un utilisateur à un cours
  async enrollInCourse(userId: number, courseId: number, groupId: number): Promise<Enrollment> {
    return this.createEnrollment({
      user_id: userId,
      course_id: courseId,
      status: 'active',
      group_id: groupId,
    });
  }



  // Désinscrire un utilisateur
  async unenroll(enrollmentId: number): Promise<void> {
    await this.updateEnrollment(enrollmentId, { status: 'cancelled' });
  }

  // Activer une inscription (admin only)
  async activateEnrollment(id: number): Promise<Enrollment> {
    const response = await this.makeRequest<{ enrollment: Enrollment }>(`/enrollments/${id}/activate`, {
      method: 'POST',
    });
    return response.enrollment;
  }

  // Annuler une inscription (admin only)
  async cancelEnrollment(id: number): Promise<Enrollment> {
    const response = await this.makeRequest<{ enrollment: Enrollment }>(`/enrollments/${id}/cancel`, {
      method: 'POST',
    });
    return response.enrollment;
  }

  // Créer plusieurs inscriptions en lot (admin only)
  async createBulkEnrollments(enrollmentsData: CreateEnrollmentData[]): Promise<Enrollment[]> {
    const enrollments: Enrollment[] = [];
    const errors: string[] = [];

    for (const data of enrollmentsData) {
      try {
        const enrollment = await this.createEnrollment(data);
        enrollments.push(enrollment);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to enroll user ${data.user_id}: ${errorMessage}`);
      }
    }

    if (errors.length > 0 && enrollments.length === 0) {
      throw new Error(`All enrollments failed: ${errors.join(', ')}`);
    }

    if (errors.length > 0) {
      console.warn('Some enrollments failed:', errors);
    }

    return enrollments;
  }
}

export const enrollmentService = new EnrollmentService();