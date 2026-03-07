// Service de gestion des cours et des groupes
import { BaseApiService } from './baseApi';

export interface CourseGroup {
  id: number;
  course_id: number;
  // Optional label fields
  title?: string;
  subtitle?: string;
  day: string;
  time: string;
  price: number;
  instructor_id: number;
  instructor?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  meeting_link?: string;
  capacity: number;
  status: 'active' | 'inactive' | 'full';
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  short_description: string;
  image_url?: string;
  type: 'in-person' | 'online';
  duration_months: number;
  sessions_per_month: number;
  status: 'active' | 'inactive' | 'completed';
  groups: CourseGroup[];
  created_at: string;
  updated_at: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  short_description: string;
  type: 'in-person' | 'online';
  duration_months: number;
  sessions_per_month: number;
  image_url?: string;
  groups: {
  title?: string;
  subtitle?: string;
  day?: string;
  jour?: number;
  month?: number;
  time?: string;
  price: number;
  instructor_id?: number;
  meeting_link?: string;
  capacity?: number;
  }[];
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  short_description?: string;
  type?: 'in-person' | 'online';
  duration_months?: number;
  sessions_per_month?: number;
  image_url?: string;
  status?: 'active' | 'inactive' | 'completed';
  groups?: {
  title?: string;
  subtitle?: string;
  day?: string;
  jour?: number;
  month?: number;
  time?: string;
  price: number;
  instructor_id?: number;
  meeting_link?: string;
  capacity?: number;
  }[];
}

export interface CourseFilters {
  type?: 'in-person' | 'online';
  status?: 'active' | 'inactive' | 'completed';
  search?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
  errors?: any;
}

export interface CourseStats {
  total_courses: number;
  active_courses: number;
  inactive_courses: number;
  completed_courses: number;
  courses_by_type: {
    'in-person': number;
    online: number;
  };
  total_groups: number;
  active_groups: number;
}

class CourseService extends BaseApiService {
  constructor() {
    super();
  }

  /**
   * Récupérer tous les cours avec filtres optionnels
   */
  async getAllCourses(filters?: CourseFilters): Promise<Course[]> {
    console.log('📡 CourseService: Calling getAllCourses with filters:', filters);
    
    const params = new URLSearchParams();
    
    if (filters?.type) {
      params.append('type', filters.type);
    }
    
    if (filters?.status) {
      params.append('status', filters.status);
    }
    
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const queryString = params.toString();
    const url = `/courses${queryString ? `?${queryString}` : ''}`;
    
    console.log('📡 CourseService: Making request to:', url);
    
    try {
      const response = await this.makeRequest<ApiResponse<Course[]>>(url);
      console.log('✅ CourseService: Response received:', response);
      return response.data;
    } catch (error) {
      console.error('❌ CourseService: Error in getAllCourses:', error);
      throw error;
    }
  }

  /**
   * Récupérer un cours par ID
   */
  async getCourseById(id: number): Promise<Course> {
    const response = await this.makeRequest<ApiResponse<Course>>(`/courses/${id}`);
    return response.data;
  }

  /**
   * Créer un nouveau cours
   */
  async createCourse(courseData: CreateCourseData): Promise<Course> {
    const response = await this.makeRequest<ApiResponse<Course>>('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
    return response.data;
  }

  /**
   * Mettre à jour un cours
   */
  async updateCourse(id: number, courseData: UpdateCourseData): Promise<Course> {
    const response = await this.makeRequest<ApiResponse<Course>>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
    return response.data;
  }

  /**
   * Supprimer un cours
   */
  async deleteCourse(id: number): Promise<void> {
    await this.makeRequest<ApiResponse<null>>(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Rechercher des cours
   */
  async searchCourses(query: string): Promise<Course[]> {
    const params = new URLSearchParams({ q: query });
    const response = await this.makeRequest<ApiResponse<Course[]>>(`/courses/search?${params.toString()}`);
    return response.data;
  }

  /**
   * Récupérer les statistiques des cours
   */
  async getCourseStats(): Promise<CourseStats> {
    const response = await this.makeRequest<ApiResponse<CourseStats>>('/courses/stats');
    return response.data;
  }

  /**
   * Récupérer les cours par type (in-person ou online)
   */
  async getCoursesByType(type: 'in-person' | 'online'): Promise<Course[]> {
    return this.getAllCourses({ type, status: 'active' });
  }

  /**
   * Récupérer les cours actifs uniquement
   */
  async getActiveCourses(): Promise<Course[]> {
    return this.getAllCourses({ status: 'active' });
  }

  /**
   * Mettre à jour uniquement le meeting_link d'un groupe de cours
   */
  async updateCourseGroupMeetingLink(groupId: number, meetingLink: string | null): Promise<CourseGroup> {
    const body = { meeting_link: meetingLink };
    const response = await this.makeRequest<{ success: boolean; data: CourseGroup }>(`/course-groups/${groupId}/meeting-link`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return response.data;
  }

  /**
   * Mettre à jour des champs d'un groupe (ex: title, subtitle)
   */
  async updateCourseGroup(
    groupId: number,
    data: Partial<Pick<CourseGroup, 'title' | 'subtitle' | 'meeting_link' | 'time' | 'day' | 'price' | 'instructor_id'>>
  ): Promise<CourseGroup> {
    const response = await this.makeRequest<{ success: boolean; data: CourseGroup }>(`/course-groups/${groupId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  }
}

// Singleton instance
export const courseService = new CourseService();