import { useAppSelector } from '../store';
import { getCachedInitialData } from '../utils/initialDataFetch';

interface UseAppDataOptions {
  includeCached?: boolean;
  requireAuth?: boolean;
}

export const useAppData = (options: UseAppDataOptions = {}) => {
  const { includeCached = true, requireAuth = false } = options;
  
  // Données depuis le store Redux
  const courses = useAppSelector(state => state.courses.courses);
  const users = useAppSelector(state => state.user.users);
  const userStats = useAppSelector(state => state.user.userStats);
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  
  // Loading states
  const coursesLoading = useAppSelector(state => state.courses.isLoading);
  const usersLoading = useAppSelector(state => state.user.isLoading);
  
  // Error states
  const coursesError = useAppSelector(state => state.courses.error);
  const usersError = useAppSelector(state => state.user.error);

  // Données en cache (fallback)
  const cachedData = includeCached ? getCachedInitialData() : null;

  // Calculer les instructeurs depuis les users
  const instructors = users.filter(u => u.role === 'prof');
  const cachedInstructors = cachedData?.instructors || [];
  
  // Fonction pour obtenir les données avec fallback sur le cache
  const getDataWithFallback = <T,>(storeData: T[], cachedData: T[] | null, loading: boolean): T[] => {
    if (loading && (!storeData || storeData.length === 0) && cachedData && cachedData.length > 0) {
      return cachedData;
    }
    return storeData || [];
  };

  // État global de chargement
  const isLoading = coursesLoading || (requireAuth && usersLoading);
  const hasErrors = !!(coursesError || (requireAuth && usersError));
  
  // Vérifier si les données de base sont disponibles
  const hasBasicData = (courses.length > 0 || (cachedData?.courses && cachedData.courses.length > 0));
  
  // Vérifier si les données d'auth sont disponibles (si requises)
  const hasAuthData = !requireAuth || 
                     (isAuthenticated && (users.length > 0 || (cachedData?.allUsers && cachedData.allUsers.length > 0)));

  const isReady = hasBasicData && hasAuthData;

  return {
    // État d'authentification
    isAuthenticated,
    user,
    
    // Données principales avec fallback
    courses: getDataWithFallback(courses, cachedData?.courses, coursesLoading),
    instructors: getDataWithFallback(instructors, cachedInstructors, usersLoading),
    allUsers: getDataWithFallback(users, cachedData?.allUsers, usersLoading),
    userStats: userStats || cachedData?.userStats,
    
    // États de chargement
    loading: {
      courses: coursesLoading,
      users: usersLoading,
      overall: isLoading
    },
    
    // États d'erreur
    errors: {
      courses: coursesError,
      users: usersError,
      hasAny: hasErrors
    },
    
    // État de disponibilité des données
    ready: {
      basicData: hasBasicData,
      authData: hasAuthData,
      overall: isReady
    },
    
    // Données en cache brutes (pour debug)
    cached: cachedData,
    
    // Utilitaires
    utils: {
      getCourseById: (id: string | number) => {
        const allCourses = getDataWithFallback(courses, cachedData?.courses, coursesLoading);
        return allCourses.find(course => course.id === Number(id));
      },
      

      
      getInstructorById: (id: string | number) => {
        const allInstructors = getDataWithFallback(instructors, cachedInstructors, usersLoading);
        return allInstructors.find(instructor => instructor.id === Number(id));
      },
      
      getUserById: (id: string | number) => {
        const allUsers = getDataWithFallback(users, cachedData?.allUsers, usersLoading);
        return allUsers.find(user => user.id === Number(id));
      }
    }
  };
};