// Service de base pour gérer les appels API
// Prefer Vite env vars VITE_API_BASE_URL and VITE_BACKEND_URL; fall back to localhost for dev.
// Default to port 8000 which is standard for Laravel
// Use localhost by default to support IPv6 if needed.
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000';

console.log('🔌 API Configuration:', {
  API_BASE_URL,
  BACKEND_URL,
  VITE_ENV: (import.meta as any).env
});

// Get the base path for assets (from Vite env)
const BASE_PATH = (import.meta as any).env?.VITE_BASE_PATH || '/';

// Utility function to build asset URLs with correct base path
export const getAssetUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Ensure BASE_PATH ends with /
  const basePath = BASE_PATH.endsWith('/') ? BASE_PATH : BASE_PATH + '/';
  return basePath + cleanPath;
};

// Network error identification helpers
export const NETWORK_ERROR_PREFIX = 'NETWORK_UNREACHABLE';
const DEFAULT_TIMEOUT_MS = 8000; // 8s timeout for API calls

// Fonction utilitaire pour construire l'URL complète d'une image de profil
export const getProfileImageUrl = (profilePicture: string | null | undefined): string => {
  // Handle null, undefined, empty string, or "null" string
  if (!profilePicture || profilePicture === 'null' || profilePicture === 'undefined' || profilePicture.trim() === '') {
    // Use local SVG avatar as fallback with correct base path
    return getAssetUrl('default-avatar.svg');
  }
  
  // Si l'URL commence déjà par http, la retourner telle quelle
  if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
    return profilePicture;
  }
  
  // Handle relative paths that might start with /
  const cleanPath = profilePicture.startsWith('/') ? profilePicture.substring(1) : profilePicture;
  
  // Construire l'URL complète avec le backend et ajouter cache-busting
  const baseUrl = `${BACKEND_URL}/storage/${cleanPath}`;
  const cacheBuster = `?v=${Date.now()}`;
  return baseUrl + cacheBuster;
};

// Build full URL for a course image stored with relative path in storage (e.g., courses/filename.jpg)
export const getCourseImageUrl = (imagePath: string | null | undefined, fallbackKey?: string): string => {
  // Fallback placeholder asset - ensure it points to assets folder
  const placeholders: Record<string, string> = {
    'decouvrir': "assets/images/blog/blog01.jpg",
    'approfondir': "assets/images/blog/blog02.jpg",
    'transmettre': "assets/images/blog/blog03.jpg",
    'default': "assets/images/blog/blog01.jpg"
  };
  
  // Try to match fallbackKey or use default
  const key = fallbackKey && placeholders[fallbackKey] ? fallbackKey : 'default';
  const placeholder = getAssetUrl(placeholders[key]);

  if (!imagePath) return placeholder;

  // Already absolute URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Normalize Windows backslashes and trim whitespace
  let p = imagePath.replace(/\\/g, '/').trim();

  // If it's already a frontend asset path, return with base path
  if (p.startsWith('/assets/') || p.startsWith('assets/')) {
    // Use getAssetUrl() so it works when the app is served under a subpath.
    const clean = p.startsWith('/') ? p.slice(1) : p;
    return getAssetUrl(clean);
  }

  // If path already contains '/storage/', it may be full storage path returned by backend
  if (p.includes('/storage/')) {
    // If it starts with /storage/... then prefix backend host
    if (p.startsWith('/storage/')) {
      return `${BACKEND_URL}${p}?v=${Date.now()}`;
    }
    // If it contains storage elsewhere, try to extract the segment after storage/
    const idx = p.indexOf('/storage/');
    const after = p.substring(idx + 9); // 9 == '/storage/'.length
    return `${BACKEND_URL}/storage/${after}?v=${Date.now()}`;
  }

  // Remove leading 'public/' if present (some backends store with public/ prefix)
  if (p.startsWith('public/')) p = p.substring(7);

  // Remove leading slash to avoid double slashes when building URL
  if (p.startsWith('/')) p = p.substring(1);

  // Build final URL pointing to the backend storage
  return `${BACKEND_URL}/storage/${p}?v=${Date.now()}`;
};

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export class BaseApiService {
  protected getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    console.log('🔵 Auth token found:', token ? 'YES' : 'NO', token ? token.substring(0, 20) + '...' : 'N/A');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  protected getUploadHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  protected async handleApiError(response: Response): Promise<never> {
    // Try to parse JSON, else fallback to text/HTML snippets
    try {
      const error: ApiError = await response.json();
      let errorMessage = error.message || `API request failed with status ${response.status}`;
      
      // Append validation errors if available
      if (error.errors) {
        const validationMessages = Object.values(error.errors).flat().join(' ');
        if (validationMessages) {
          errorMessage += `: ${validationMessages}`;
        }
      }
      
      throw new Error(errorMessage);
    } catch (e: any) {
      // If we already threw a formatted error, rethrow it
      if (e.message && e.message !== 'Unexpected end of JSON input') {
        throw e;
      }
      
      try {
        const txt = await response.text();
        const snippet = txt?.slice(0, 200) || '';
        
        // Specific error for payload too large
        if (response.status === 413) {
          throw new Error(`L'image est trop grande. Veuillez utiliser une image plus petite (max 10MB).`);
        }
        
        throw new Error(`API request failed (status ${response.status}). Body: ${snippet}`);
      } catch {
        if (response.status === 413) {
          throw new Error(`L'image est trop grande. Veuillez utiliser une image plus petite.`);
        }
        throw new Error(`API request failed (status ${response.status}).`);
      }
    }
  }

  protected async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<T> {
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log('🌐 API REQUEST =>', fullUrl, options.method || 'GET');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const mergedHeaders: HeadersInit = {
        ...this.getAuthHeaders(),
        ...(options.headers as any || {}),
      };
      const response = await fetch(fullUrl, {
        ...options,
        headers: mergedHeaders,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      console.log('🌐 API RESPONSE STATUS <=', response.status, fullUrl);

      if (!response.ok) {
        try {
          const clone = response.clone();
          const txt = await clone.text();
          console.warn('🚨 API ERROR BODY:', txt);
        } catch {}
        if (response.status === 401) {
          // Token invalid / expired: cleanup + redirect (no extra network request)
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userRole');
          
          // Update Redux state to reflect logout immediately via event
          window.dispatchEvent(new CustomEvent('auth:logout'));

          try { sessionStorage.setItem('postLoginRedirect', window.location.hash || '#/'); } catch {}
          if (!window.location.hash.includes('login')) {
            window.location.hash = '#/login';
          }
        }
        // Delegate to robust error handler (handles HTML bodies too)
        await this.handleApiError(response);
      }

      const json = await response.json();
      console.log('📦 API JSON <=', fullUrl, json);
      return json;
    } catch (err: any) {
      clearTimeout(timeout);
      // Network-level issues (connection refused / CORS / timeout / abort)
      if (err?.name === 'AbortError') {
        throw new Error(`${NETWORK_ERROR_PREFIX}: Request timed out after ${timeoutMs}ms (backend not responding at ${BACKEND_URL}).`);
      }
      if (err?.message?.includes('Failed to fetch') || err?.code === 'ECONNREFUSED') {
        throw new Error(`${NETWORK_ERROR_PREFIX}: Unable to reach backend at ${BACKEND_URL}. Make sure the backend server is running (either \"php artisan serve\" or \"php -S 127.0.0.1:8000 server.php\" from the backend folder) and port 8000 is open.`);
      }
      console.error('🔌 Unexpected network error:', err);
      throw err;
    }
  }

  protected async makeUploadRequest<T>(
    url: string, 
    formData: FormData,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<T> {
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log('🌐 UPLOAD REQUEST =>', fullUrl, 'FormData keys:', Array.from(formData.keys()));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: this.getUploadHeaders(),
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      console.log('🌐 UPLOAD RESPONSE STATUS <=', response.status, fullUrl);

      if (!response.ok) {
        await this.handleApiError(response);
      }

      const result = await response.json();
      console.log('📦 UPLOAD JSON <=', fullUrl, result);
      return result;
    } catch (err: any) {
      clearTimeout(timeout);
      if (err?.name === 'AbortError') {
        throw new Error(`${NETWORK_ERROR_PREFIX}: Upload timed out after ${timeoutMs}ms`);
      }
      if (err?.message?.includes('Failed to fetch') || err?.code === 'ECONNREFUSED') {
        throw new Error(`${NETWORK_ERROR_PREFIX}: Unable to reach backend at ${BACKEND_URL}. Make sure Laravel server is running on port 8000.`);
      }
      throw err;
    }
  }
}