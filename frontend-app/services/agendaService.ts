import { API_BASE_URL, BaseApiService } from './baseApi';
import { ParcoursModule } from './parcoursService';

export interface ParcoursSession {
  id: number;
  parcours_module_id: number;
  start_date: string;
  end_date: string;
  location?: string;
  max_participants: number;
  current_participants: number;
  notes?: string;
  module?: ParcoursModule;
}

class AgendaService extends BaseApiService {
  async getAllSessions(startDate?: string, endDate?: string): Promise<ParcoursSession[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await fetch(`${API_BASE_URL}/parcours-sessions?${params.toString()}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      await this.handleApiError(response);
    }

    return response.json();
  }

  async createSession(data: Partial<ParcoursSession>): Promise<ParcoursSession> {
    const response = await fetch(`${API_BASE_URL}/parcours-sessions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      await this.handleApiError(response);
    }

    return response.json();
  }

  async updateSession(id: number, data: Partial<ParcoursSession>): Promise<ParcoursSession> {
    const response = await fetch(`${API_BASE_URL}/parcours-sessions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      await this.handleApiError(response);
    }

    return response.json();
  }

  async deleteSession(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/parcours-sessions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      await this.handleApiError(response);
    }
  }
}

export const agendaService = new AgendaService();
