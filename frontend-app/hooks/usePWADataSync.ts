import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAllParcours } from '../store/slices/parcoursSlice';

import { fetchUsersAsync, fetchUserStatsAsync } from '../store/slices/userSlice';
import { fetchUserAccessibleDepartmentsAsync } from '../store/slices/departmentsSlice';
import { pwaCache } from '../utils/pwaCache';
import { shouldSyncAggressively, isPWA } from '../utils/pwaUtils';

interface UsePWADataSyncOptions {
  enabled?: boolean;
  syncInterval?: number; // en millisecondes
  forceSync?: boolean;
  isAuthenticated?: boolean; // Pour différencier les données à fetch
}

export const usePWADataSync = (options: UsePWADataSyncOptions = {}) => {
  const {
    enabled = true,
    syncInterval = 5 * 60 * 1000, // 5 minutes par défaut
    forceSync = false,
    isAuthenticated = false
  } = options;

  const dispatch = useAppDispatch();
  const { isAuthenticated: authFromStore, user } = useAppSelector(state => state.auth);
  const lastSyncRef = useRef<number>(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Utiliser isAuthenticated depuis le store si pas fourni en option
  const actuallyAuthenticated = isAuthenticated || authFromStore;

  const syncData = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Définir les données à synchroniser selon l'authentification
    const baseCacheKeys = ['courses_data'];
    const authCacheKeys = actuallyAuthenticated ? 
      [...baseCacheKeys, 'instructors_data', 'user_stats_data', 'all_users_data', 'departments_data'] : 
      baseCacheKeys;
    
    const hasValidCache = !force && authCacheKeys.every(key => pwaCache.isValid(key));
    
    // Adapter la stratégie de sync selon la connexion
    const aggressiveSync = shouldSyncAggressively();
    const actualSyncInterval = aggressiveSync ? syncInterval : syncInterval * 2;
    
    if (hasValidCache && !force && now - lastSyncRef.current < actualSyncInterval) {
      console.log('🔄 Sync skipped - cache is valid and recent', { 
        aggressiveSync, 
        isPWAMode: isPWA(),
        authenticated: actuallyAuthenticated,
        cacheKeys: authCacheKeys
      });
      return;
    }

    try {
      console.log('🔄 Syncing PWA data...', { 
        force, 
        lastSync: new Date(lastSyncRef.current).toISOString(),
        cacheValid: hasValidCache,
        aggressiveSync,
        isPWAMode: isPWA(),
        authenticated: actuallyAuthenticated
      });
      
      // Données de base (toujours disponibles)
      const basePromises: any[] = [
        dispatch(fetchAllParcours())
      ];
      
      // Données supplémentaires si authentifié
      const authPromises = actuallyAuthenticated && user ? [
        dispatch(fetchUsersAsync()), // Pour récupérer les instructeurs/profs
        dispatch(fetchUserStatsAsync()),
        dispatch(fetchUserAccessibleDepartmentsAsync(user.role))
      ] : [];
      
      const allPromises = [...basePromises, ...authPromises];
      const results = await Promise.all(allPromises);
      
      const [coursesResult] = results;
      const authResults = results.slice(1);
      
      // Mettre en cache les résultats de base
      if (coursesResult.meta.requestStatus === 'fulfilled') {
        pwaCache.set('courses_data', coursesResult.payload, syncInterval);
      }
      
      // Mettre en cache les données d'authentification si disponibles
      if (actuallyAuthenticated && authResults.length > 0) {
        const [usersResult, userStatsResult, departmentsResult] = authResults;
        
        if (usersResult && usersResult.meta.requestStatus === 'fulfilled') {
          pwaCache.set('all_users_data', usersResult.payload, syncInterval);
          // Cache spécifique pour les instructeurs
          const instructors = (usersResult.payload as any[])?.filter(user => user.role === 'prof') || [];
          pwaCache.set('instructors_data', instructors, syncInterval);
        }
        
        if (userStatsResult && userStatsResult.meta.requestStatus === 'fulfilled') {
          pwaCache.set('user_stats_data', userStatsResult.payload, syncInterval);
        }
        
        if (departmentsResult && departmentsResult.meta.requestStatus === 'fulfilled') {
          pwaCache.set('departments_data', departmentsResult.payload, syncInterval);
        }
      }
      
      lastSyncRef.current = now;
      console.log('✅ PWA data sync completed and cached', {
        authenticated: actuallyAuthenticated,
        dataTypes: authCacheKeys
      });
      
      // Émettre un événement pour notifier la mise à jour
      window.dispatchEvent(new CustomEvent('pwa-data-updated', {
        detail: { 
          timestamp: now, 
          courses: coursesResult.payload, 
          instructors: actuallyAuthenticated && authResults[0] ? authResults[0].payload : [],
          authenticated: actuallyAuthenticated,
          departments: authResults[2]?.payload || null
        }
      }));
    } catch (error) {
      console.error('❌ PWA data sync failed:', error);
      
      // En cas d'erreur, essayer de charger depuis le cache
      const cachedData = authCacheKeys.reduce((acc, key) => {
        acc[key] = pwaCache.get(key);
        return acc;
      }, {} as Record<string, any>);
      
      const hasCachedData = Object.values(cachedData).some(data => data !== null);
      if (hasCachedData) {
        console.log('📱 Using cached data as fallback', { cachedKeys: Object.keys(cachedData).filter(k => cachedData[k]) });
      }
    }
  }, [dispatch, syncInterval, actuallyAuthenticated, user]);

  // Sync initial au montage
  useEffect(() => {
    if (!enabled) return;
    
    syncData(forceSync);
  }, [enabled, forceSync, syncData]);

  // Sync périodique
  useEffect(() => {
    if (!enabled || syncInterval <= 0) return;

    syncIntervalRef.current = setInterval(() => {
      // Sync seulement si l'app est visible
      if (!document.hidden) {
        syncData();
      }
    }, syncInterval);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [enabled, syncInterval, syncData]);

  // Gestionnaires d'événements PWA
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📱 App became visible');
        syncData();
      }
    };

    const handleFocus = () => {
      console.log('📱 App focused');
      syncData();
    };

    const handleOnline = () => {
      console.log('🌐 App back online');
      syncData(true); // Force sync when back online
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('📱 Page restored from bfcache');
        syncData(true);
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      // Sync si le token d'auth a changé (multi-tab sync)
      if (event.key === 'auth_token' || event.key === 'token') {
        console.log('🔑 Auth token changed in another tab');
        syncData(true);
      }
    };

    // Event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [enabled, syncData]);

  return {
    syncData: () => syncData(true),
    lastSync: lastSyncRef.current
  };
};