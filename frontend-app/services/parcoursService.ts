import { API_BASE_URL } from './baseApi';

export interface ParcoursModule {
  id?: number;
  parcours_id?: number;
  title: string;
  duration?: string;
  horaires?: string;
  prerequis?: string;
  subtitle?: string;
  description?: string;
  details?: string;
  icon?: string;
  price?: string;
  place?: string;
  order?: number;
  reference?: string; // e.g. D1, V1, M1
  sessions?: any[];
}

export interface Parcours {
  id: number;
  title: string;
  slug: string;
  description?: string;
  photo?: string;
  lieu?: string;
  horaires?: string;
  price?: string;
  price_ht?: string;
  cta_link?: string;
  is_active: boolean;
  modules: ParcoursModule[];
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const parcoursService = {
  getAll: async () => {
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const response = await fetch(`${baseUrl}/parcours`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch modules');
    return response.json();
  },

  getBySlug: async (slug: string) => {
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const response = await fetch(`${baseUrl}/parcours/${slug}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch modules');
    return response.json();
  },

  update: async (id: number, data: Partial<Parcours>) => {
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const response = await fetch(`${baseUrl}/parcours/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update module');
    return response.json();
  },

  create: async (data: Partial<Parcours>) => {
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const response = await fetch(`${baseUrl}/parcours`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create module');
    return response.json();
  },

  delete: async (id: number) => {
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const response = await fetch(`${baseUrl}/parcours/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete module');
    return response.json();
  },
};
