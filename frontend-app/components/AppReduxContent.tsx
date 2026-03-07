// Composant interne qui utilise Redux - sera intégré dans App.tsx plus tard
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { restoreAuthState, selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice';
import { restoreUIPreferences } from '../store/slices/uiSlice';
import NotificationToast from './NotificationToast';

const AppReduxContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    // Restaurer l'état d'authentification depuis localStorage au démarrage
    dispatch(restoreAuthState());
    
    // Restaurer les préférences UI depuis localStorage
    dispatch(restoreUIPreferences());
  }, [dispatch]);

  // Ce composant peut être utilisé pour des fonctionnalités globales Redux
  // Pour l'instant, il ne fait que gérer les notifications
  return (
    <>
      <NotificationToast />
      {/* Ici on peut ajouter d'autres composants globaux Redux */}
      
      {/* Debug info - à supprimer en production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded text-xs max-w-sm">
          <div>Redux Status:</div>
          <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
          <div>User: {currentUser?.firstName || 'None'}</div>
        </div>
      )}
    </>
  );
};

export default AppReduxContent;