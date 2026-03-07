import { AppDispatch } from '../store';
import { fetchAllParcours } from '../store/slices/parcoursSlice';
import { fetchUsersAsync, fetchUserStatsAsync } from '../store/slices/userSlice';

interface InitialDataFetchOptions {
  isAuthenticated: boolean;
  userId?: string;
  force?: boolean;
}

export const fetchInitialData = async (
  dispatch: AppDispatch, 
  options: InitialDataFetchOptions
) => {
  const { isAuthenticated, userId, force = false } = options;

  console.log('🚀 Fetching initial data...', { 
    isAuthenticated, 
    userId: userId || 'none',
    force 
  });

  try {
    // Toujours fetch les données de base (publiques)
    const baseDataPromises = [
      dispatch(fetchAllParcours())
    ];

    // Données supplémentaires si authentifié
    const authDataPromises = isAuthenticated ? [
      dispatch(fetchUsersAsync()), // Pour les instructeurs - seulement si authentifié
      dispatch(fetchUserStatsAsync())
    ] : [];

    // Exécuter toutes les requêtes en parallèle
    const [baseResults, authResults] = await Promise.all([
      Promise.all(baseDataPromises),
      Promise.all(authDataPromises)
    ]);

    const [parcoursResult] = baseResults;

    // Gérer les résultats et le cache
    let successCount = 0;
    let errorCount = 0;

    // Parcours
    if (parcoursResult.meta.requestStatus === 'fulfilled') {
      successCount++;
      console.log('✅ Parcours fetched successfully');
    } else {
      errorCount++;
      console.error('❌ Failed to fetch courses:', parcoursResult.meta.requestStatus);
    }

    // Données d'authentification
    if (isAuthenticated && authResults.length > 0) {
      const [usersResult, userStatsResult] = authResults;
      
      // Users/Instructors
      if (usersResult.meta.requestStatus === 'fulfilled') {
        successCount++;
        console.log('✅ Users/Instructors fetched successfully');
      } else {
        errorCount++;
        console.error('❌ Failed to fetch users:', usersResult.meta.requestStatus);
      }
      if (userStatsResult && userStatsResult.meta.requestStatus === 'fulfilled') {
        successCount++;
        console.log('✅ User stats fetched successfully');
      } else {
        errorCount++;
        console.error('❌ Failed to fetch user stats:', userStatsResult?.meta.requestStatus);
      }
    }

    console.log(`🎯 Initial data fetch completed: ${successCount} success, ${errorCount} errors`);

    // Émettre un événement pour notifier que les données initiales sont prêtes
    window.dispatchEvent(new CustomEvent('initial-data-ready', {
      detail: {
        isAuthenticated,
        successCount,
        errorCount,
        timestamp: Date.now()
      }
    }));

    return { successCount, errorCount };

  } catch (error) {
    console.error('❌ Critical error during initial data fetch:', error);
    throw error;
  }
};
