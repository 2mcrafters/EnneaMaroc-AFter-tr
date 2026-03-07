import { isRejectedWithValue, Middleware, isRejected } from '@reduxjs/toolkit';
import { showError } from '../slices/uiSlice';

/**
 * Middleware to handle global errors from async thunks.
 * It listens for rejected actions and dispatches a notification.
 */
export const errorMiddleware: Middleware = (api) => (next) => (action: any) => {
  // Skip if it's not a rejected action
  if (!isRejected(action)) {
    return next(action);
  }

  // If the action was rejected with a value (handled error in thunk)
  if (isRejectedWithValue(action)) {
    const message = typeof action.payload === 'string' 
      ? action.payload 
      : (action.payload as any)?.message || 'Une erreur est survenue';
      
    api.dispatch(showError({
      title: 'Erreur',
      message: message
    }));
  } 
  // If it was rejected without a value (unhandled exception)
  else if (action.error) {
    const message = action.error.message || 'Une erreur inattendue est survenue';
    
    api.dispatch(showError({
      title: 'Erreur Système',
      message: message
    }));
  }

  return next(action);
};
