import { AppDispatch } from '../store';
import { fetchAllParcours } from '../store/slices/parcoursSlice';

import { fetchAllEnrollments, fetchUserEnrollments } from '../store/enrollmentsSlice';
import { fetchAllPayments, fetchUserPayments } from '../store/slices/paymentsSlice';
import { fetchUsersAsync } from '../store/slices/userSlice';

/**
 * Précharge toutes les données nécessaires après le login
 * pour éviter les fetch multiples dans chaque page
 */
export const preloadAllData = async (dispatch: AppDispatch, userRole: string, userId?: number) => {
  console.log('🚀 Preloading all data for user role:', userRole, 'userId:', userId);
  
  try {
    // Fetch parallèle de toutes les données de base
    const promises = [];
    
    // Toujours charger les parcours
    console.log('📚 Loading parcours...');
    promises.push(dispatch(fetchAllParcours()));

    
    // Toujours charger les utilisateurs pour tous les rôles (pour voir profs, étudiants, etc.)
    console.log('👥 Loading users for all roles...');
    promises.push(dispatch(fetchUsersAsync()));
    
    // Pour les admins et employés, charger toutes les données
    if (userRole === 'admin' || userRole === 'employee') {
      console.log('👑 Loading admin/employee data (all enrollments, payments)...');
      promises.push(dispatch(fetchAllEnrollments()));
      promises.push(dispatch(fetchAllPayments()));
    }
    
    // Pour les professeurs, charger leurs données spécifiques
    if (userRole === 'prof') {
      console.log('👨‍🏫 Loading professor data...');
      // Les profs ont besoin de voir les enrollments et payments pour gérer leurs étudiants
      promises.push(dispatch(fetchAllEnrollments()));
      promises.push(dispatch(fetchAllPayments()));
    }
    
    // Pour les étudiants, charger leurs données personnelles ET les cours disponibles
    if (userRole === 'student' && userId) {
      console.log('🎓 Loading student data for userId:', userId);
      promises.push(dispatch(fetchUserEnrollments(userId)));
      promises.push(dispatch(fetchUserPayments(userId)));
      // Les étudiants ont besoin de voir tous les cours disponibles (déjà ajoutés au début)
    }
    
    // Attendre que tous les fetch soient terminés
    console.log('⏳ Waiting for all data to load...');
    const results = await Promise.allSettled(promises);
    
    // Vérifier si tous les fetch ont réussi
    const allSucceeded = results.every(result => result.status === 'fulfilled');
    
    // Afficher les résultats détaillés pour le debugging
    console.log('📊 Preload results:', results.map((r, i) => {
      if (r.status === 'fulfilled') {
        return `✅ Success: ${(r as any).value?.type || 'Unknown action'}`;
      } else {
        return `❌ Failed: ${(r as any).reason || 'Unknown error'}`;
      }
    }));
    
    if (allSucceeded) {
      console.log('✅ All data preloaded successfully');
    } else {
      console.warn('⚠️ Some data failed to preload, but continuing');
    }
    
    // Même si certains fetch échouent, on considère que le préchargement a été fait
    return true;
  } catch (error) {
    console.error('❌ Error preloading data:', error);
    return false;
  }
};

/**
 * Fonction simplifiée pour refresh uniquement les données critiques
 * Utile pour les actions qui nécessitent une mise à jour rapide
 */
export const refreshCriticalData = async (dispatch: AppDispatch, userRole: string, userId?: number) => {
  console.log('🔄 Refreshing critical data for user role:', userRole);
  
  try {
    if (userRole === 'admin' || userRole === 'employee') {
      // Pour les admins, refresh les données qui changent souvent
      await Promise.all([
        dispatch(fetchAllPayments()),
        dispatch(fetchAllEnrollments())
      ]);
    }
    
    if (userRole === 'student' && userId) {
      // Pour les étudiants, refresh leurs données personnelles
      await Promise.all([
        dispatch(fetchUserEnrollments(userId)),
        dispatch(fetchUserPayments(userId))
      ]);
    }
    
    console.log('✅ Critical data refreshed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error refreshing critical data:', error);
    return false;
  }
};

/**
 * Refresh spécifique pour les données utilisateur
 * Utilisé après des actions comme upload de proof de paiement
 */
export const refreshUserData = async (dispatch: AppDispatch, userId: number) => {
  console.log('🔄 Refreshing user data for userId:', userId);
  
  try {
    // Refresher les données utilisateur et aussi mettre à jour la marque dans sessionStorage
    await Promise.all([
      dispatch(fetchUserEnrollments(userId)),
      dispatch(fetchUserPayments(userId))
    ]);
    
    // Mettre à jour le temps de la dernière actualisation sans supprimer le flag
    sessionStorage.setItem('dataFetchedTime', Date.now().toString());
    
    // Notifier que les données utilisateur ont été actualisées
    window.dispatchEvent(new CustomEvent('app:userDataRefreshed', { 
      detail: { userId, timestamp: Date.now() } 
    }));
    
    console.log('✅ User data refreshed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error refreshing user data:', error);
    return false;
  }
};

/**
 * Marque les données comme étant fetchées pour éviter les re-fetch
 * Utilise sessionStorage pour persister l'état pendant la session
 */
export const markDataAsFetched = () => {
  sessionStorage.setItem('dataFetched', 'true');
  sessionStorage.setItem('dataFetchedTime', Date.now().toString());
  
  // Dispatch un événement personnalisé pour notifier l'application que les données sont chargées
  const dataLoadedEvent = new CustomEvent('app:dataLoaded', { 
    detail: { timestamp: Date.now() } 
  });
  window.dispatchEvent(dataLoadedEvent);
  
  console.log('✅ Data marked as fetched for this session');
};

/**
 * Vérifie si les données ont déjà été fetchées dans cette session
 */
export const hasDataBeenFetched = (): boolean => {
  const fetched = sessionStorage.getItem('dataFetched');
  const fetchTime = sessionStorage.getItem('dataFetchedTime');
  
  if (!fetched || !fetchTime) {
    return false;
  }
  
  // Considérer les données comme "fraîches" pendant 30 minutes
  const thirtyMinutes = 30 * 60 * 1000;
  const timeSinceFetch = Date.now() - parseInt(fetchTime);
  
  if (timeSinceFetch > thirtyMinutes) {
    console.log('⏰ Data fetch expired, will refresh');
    sessionStorage.removeItem('dataFetched');
    sessionStorage.removeItem('dataFetchedTime');
    return false;
  }
  
  console.log('✅ Data already fetched in this session');
  return true;
};

/**
 * Version améliorée de preloadAllData qui évite les re-fetch
 */
export const preloadAllDataOnce = async (dispatch: AppDispatch, userRole: string, userId?: number) => {
  // Vérifier si les données ont déjà été fetchées
  if (hasDataBeenFetched()) {
    console.log('🔄 Data already fetched, skipping preload');
    return true;
  }
  
  // Sinon, faire le preload normal
  const success = await preloadAllData(dispatch, userRole, userId);
  
  if (success) {
    markDataAsFetched();
  }
  
  return success;
};

/**
 * Force un refresh complet de toutes les données de l'application
 * Peut être appelé de n'importe où dans l'application (bouton refresh, après login, etc.)
 */
export const forceRefreshAllData = async (dispatch: AppDispatch, userRole: string, userId?: number) => {
  console.log('🔄 Forçage du rechargement de toutes les données de l\'application...', { userRole, userId });
  
  // Supprimer les marqueurs de cache pour forcer un rechargement complet
  sessionStorage.removeItem('dataFetched');
  sessionStorage.removeItem('dataFetchedTime');
  
  // Dispatch un événement pour notifier l'application du début du rechargement
  window.dispatchEvent(new CustomEvent('app:dataRefreshStarted'));
  
  let success = false;
  
  try {
    // Recharger les données de base (parcours et utilisateurs) pour tous les utilisateurs
    const basePromises: any[] = [
      dispatch(fetchAllParcours()),

      dispatch(fetchUsersAsync()) // Tous les rôles peuvent voir les utilisateurs
    ];
    
    // Pour les administrateurs et employés, recharger toutes les données
    if (userRole === 'admin' || userRole === 'employee') {
      basePromises.push(dispatch(fetchAllEnrollments()));
      basePromises.push(dispatch(fetchAllPayments()));
    }
    
    // Pour les professeurs, recharger leurs données spécifiques
    if (userRole === 'prof') {
      basePromises.push(dispatch(fetchAllEnrollments()));
      basePromises.push(dispatch(fetchAllPayments()));
    }
    
    // Pour les étudiants, recharger leurs données personnelles
    if (userRole === 'student' && userId) {
      console.log('🧑‍🎓 Rechargeant spécifiquement les données de l\'étudiant ID:', userId);
      basePromises.push(dispatch(fetchUserEnrollments(userId)));
      basePromises.push(dispatch(fetchUserPayments(userId)));
    }
    
    // Attendre que tous les fetch soient terminés
    console.log('⏳ Rechargement en cours...');
    const results = await Promise.allSettled(basePromises);
    
    // Vérifier les résultats
    const allSucceeded = results.every(result => result.status === 'fulfilled');
    success = allSucceeded;
    
    // Log des résultats pour le debugging
    console.log('📊 Résultats du rechargement:', results.map((r, i) => {
      if (r.status === 'fulfilled') {
        return `✅ Succès: ${(r as any).value?.type || 'Action inconnue'}`;
      } else {
        return `❌ Échec: ${(r as any).reason || 'Erreur inconnue'}`;
      }
    }));
    
    if (success) {
      markDataAsFetched();
      
      // Dispatch un événement pour notifier l'application que les données ont été rechargées
      window.dispatchEvent(new CustomEvent('app:dataRefreshCompleted', { 
        detail: { timestamp: Date.now() } 
      }));
      
      console.log('✅ Toutes les données ont été rechargées avec succès');
    } else {
      // Dispatch un événement pour notifier l'application que le rechargement a échoué
      window.dispatchEvent(new CustomEvent('app:dataRefreshFailed'));
      console.error('❌ Échec du rechargement des données');
    }
  } catch (error) {
    console.error('❌ Erreur lors du rechargement des données:', error);
    window.dispatchEvent(new CustomEvent('app:dataRefreshFailed'));
    success = false;
  }
  
  return success;
};