// Error handling utilities for the application
import { logger } from './logger';

class ErrorHandler {
  constructor() {
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', event.reason, 'ErrorHandler');
      this.logError(event.reason);
      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      logger.error('JavaScript error', event.error, 'ErrorHandler');
      this.logError(event.error);
    });

    this.isInitialized = true;
    logger.info('Error handler initialized successfully', 'ErrorHandler');
  }

  logError(error) {
    // In a real application, you would send this to your logging service
    const errorInfo = {
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace available',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // For development, just log to console
    logger.error('Error logged', error, 'ErrorHandler');

    // In production, you might want to send to an error tracking service
    // this.sendToErrorService(errorInfo);
  }

  handleApiError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error('API Error Response', error.response.data, 'API');
      return {
        type: 'api_error',
        message: error.response.data?.message || 'Une erreur est survenue côté serveur',
        status: error.response.status
      };
    } else if (error.request) {
      // The request was made but no response was received
      logger.error('API Error Request', error.request, 'API');
      return {
        type: 'network_error',
        message: 'Erreur de connexion au serveur'
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error('API Error', error, 'API');
      return {
        type: 'client_error',
        message: 'Erreur lors de la préparation de la requête'
      };
    }
  }

  handleFormError(error) {
    if (typeof error === 'string') {
      return { message: error };
    }
    
    if (error.message) {
      return { message: error.message };
    }

    return { message: 'Erreur lors du traitement du formulaire' };
  }
}

// Create and export a singleton instance
export const errorHandler = new ErrorHandler();

// Export utility functions
export const handleApiError = (error) => errorHandler.handleApiError(error);
export const handleFormError = (error) => errorHandler.handleFormError(error);
export const logError = (error) => errorHandler.logError(error);