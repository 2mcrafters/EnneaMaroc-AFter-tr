import { BaseApiService } from './baseApi';

export interface SessionCancellationPayload {
  item_type: 'course';
  course_id?: number | null;
  course_group_index?: number | null;
  day: string; // Mondays, Tuesdays, ...
  time: string; // "09:00 - 10:00"
  session_date: string; // YYYY-MM-DD
}

export interface SessionCancellation extends SessionCancellationPayload {
  id: number;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

class SessionCancellationsService extends BaseApiService {
  async list(from?: string, to?: string): Promise<SessionCancellation[]> {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const url = `/session-cancellations${qs.toString() ? `?${qs.toString()}` : ''}`;
    const res = await this.makeRequest<{ success: boolean; data: SessionCancellation[] }>(url, { method: 'GET' });
    return res.data;
  }

  async create(payload: SessionCancellationPayload): Promise<SessionCancellation> {
    console.log('🟠 Creating session cancellation payload:', payload);
    const res = await this.makeRequest<{ success: boolean; data: SessionCancellation }>(`/session-cancellations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('🟢 Created session cancellation:', res);
    return res.data;
  }

  async remove(id: number): Promise<void> {
    await this.makeRequest(`/session-cancellations/${id}`, { method: 'DELETE' });
  }
}

export const sessionCancellationsService = new SessionCancellationsService();
