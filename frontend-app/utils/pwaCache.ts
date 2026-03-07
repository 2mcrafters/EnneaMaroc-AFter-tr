// Utilitaire pour gérer le cache des données PWA
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class PWACache {
  private static instance: PWACache;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): PWACache {
    if (!PWACache.instance) {
      PWACache.instance = new PWACache();
    }
    return PWACache.instance;
  }

  set(key: string, data: any, ttl = this.defaultTTL): void {
    const now = Date.now();
    const entry: CacheEntry = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };
    
    this.cache.set(key, entry);
    
    // Sauvegarder dans localStorage pour la persistance
    try {
      localStorage.setItem(`pwa_cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to persist cache entry to localStorage:', error);
    }
  }

  get(key: string): any | null {
    let entry = this.cache.get(key);
    
    // Si pas en mémoire, essayer de récupérer depuis localStorage
    if (!entry) {
      try {
        const stored = localStorage.getItem(`pwa_cache_${key}`);
        if (stored) {
          entry = JSON.parse(stored);
          if (entry) {
            this.cache.set(key, entry);
          }
        }
      } catch (error) {
        console.warn('Failed to restore cache entry from localStorage:', error);
      }
    }

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    localStorage.removeItem(`pwa_cache_${key}`);
  }

  clear(): void {
    // Nettoyer le cache mémoire
    this.cache.clear();
    
    // Nettoyer localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('pwa_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  isValid(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    return Date.now() <= entry.expiresAt;
  }

  getAge(key: string): number {
    const entry = this.cache.get(key);
    if (!entry) return -1;
    
    return Date.now() - entry.timestamp;
  }
}

export const pwaCache = PWACache.getInstance();

// Hook pour utiliser le cache PWA
export const usePWACache = () => {
  const setCache = (key: string, data: any, ttl?: number) => {
    pwaCache.set(key, data, ttl);
  };

  const getCache = (key: string) => {
    return pwaCache.get(key);
  };

  const deleteCache = (key: string) => {
    pwaCache.delete(key);
  };

  const clearCache = () => {
    pwaCache.clear();
  };

  const isCacheValid = (key: string) => {
    return pwaCache.isValid(key);
  };

  const getCacheAge = (key: string) => {
    return pwaCache.getAge(key);
  };

  return {
    setCache,
    getCache,
    deleteCache,
    clearCache,
    isCacheValid,
    getCacheAge
  };
};