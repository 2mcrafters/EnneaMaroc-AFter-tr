import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';

import { selectAllEnrollments, selectUserEnrollments, selectUserActiveEnrollments } from '../store/enrollmentsSlice';
import { selectAllPayments, selectUserPayments } from '../store/slices/paymentsSlice';
import { selectUsers } from '../store/slices/userSlice';

/**
 * Hook personnalisé qui vérifie si les données sont disponibles dans Redux
 * sans déclencher de nouveaux fetch (sauf si les données n'existent pas du tout)
 */
export const useReduxData = () => {
  const dispatch = useAppDispatch();
  const hasFetchedRef = useRef(false);
  const currentUser = useAppSelector((state) => state.auth.user);
  
  // Sélecteurs Redux
  const coursesState = useAppSelector((state) => state.parcours.items);

  const enrollmentsState = useAppSelector(selectAllEnrollments);
  const usersState = useAppSelector(selectUsers);
  const paymentsState = useAppSelector(selectAllPayments);
  
  // Sélecteurs spécifiques à l'utilisateur
  const userEnrollmentsState = useAppSelector(state => 
    currentUser?.id ? selectUserEnrollments(state, currentUser.id) : []
  );
  
  const userActiveEnrollmentsState = useAppSelector(state => 
    currentUser?.id ? selectUserActiveEnrollments(state, currentUser.id) : []
  );
  
  const userPaymentsState = useAppSelector(state => 
    currentUser?.id ? selectUserPayments(state, currentUser.id) : []
  );

  // Vérifier si les données sont disponibles - même si elles sont vides, 
  // elles peuvent être valides (utilisateur sans enrollments, etc.)
  // On utilise le système de session storage pour savoir si le fetch a été fait
  const sessionFetched = sessionStorage.getItem('dataFetched') === 'true';
  const isDataAvailable = sessionFetched || coursesState.length > 0 || enrollmentsState.length > 0 || 
                          paymentsState.length > 0 || usersState.length > 0;

  // Marquer que nous avons des données dès qu'elles arrivent
  useEffect(() => {
    if (isDataAvailable && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      console.log('✅ Data detected in Redux store, marking as fetched');
    }
  }, [isDataAvailable]);

  return {
    // États Redux
    coursesState,

    enrollmentsState,
    usersState,
    paymentsState,
    
    // États spécifiques à l'utilisateur
    userEnrollmentsState,
    userActiveEnrollmentsState,
    userPaymentsState,
    
    // Statuts
    isDataAvailable,
    hasBeenFetched: hasFetchedRef.current,
    
    // Fonction pour marquer manuellement comme fetched (pour le login)
    markAsFetched: () => {
      hasFetchedRef.current = true;
    }
  };
};

/**
 * Hook spécialisé pour les pages qui n'ont besoin que de lire les données Redux
 * sans jamais déclencher de fetch
 */
export const useReduxDataReadOnly = () => {
  const data = useReduxData();
  
  // Log pour debugging détaillé
  useEffect(() => {
    console.log('🔍 Redux Data Status:', {
      courses: data.coursesState.length,
      enrollments: data.enrollmentsState.length,
      payments: data.paymentsState.length,
      users: data.usersState.length,
      userEnrollments: data.userEnrollmentsState.length,
      userActiveEnrollments: data.userActiveEnrollmentsState.length,
      userPayments: data.userPaymentsState.length,
      isAvailable: data.isDataAvailable,
      hasBeenFetched: data.hasBeenFetched
    });
    
    // Débogage détaillé des enrollments
    if (data.userEnrollmentsState.length > 0) {
      console.log('🔍 User-specific enrollments available:', data.userEnrollmentsState.length);
    } else if (data.enrollmentsState.length > 0) {
      console.log('🔍 Sample enrollments (general store):', data.enrollmentsState.slice(0, 3));
      const statusCounts = data.enrollmentsState.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('🔍 Enrollment status counts:', statusCounts);
    } else {
      console.log('⚠️ No enrollments found in Redux store');
    }
    
    // Débogage des paiements utilisateur
    if (data.userPaymentsState.length > 0) {
      console.log('🔍 User-specific payments available:', data.userPaymentsState.length);
    }
    
    // Vérifier la structure des données dans sessionStorage
    const sessionFetched = sessionStorage.getItem('dataFetched');
    const sessionFetchedTime = sessionStorage.getItem('dataFetchedTime');
    console.log('🔍 Session storage state:', { dataFetched: sessionFetched, dataFetchedTime: sessionFetchedTime });
  }, [data]);

  return data;
};