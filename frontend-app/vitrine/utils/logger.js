// Logger utility with different log levels
class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
  }

  // Log levels
  LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn', 
    INFO: 'info',
    DEBUG: 'debug'
  };

  // Format log message with timestamp and context
  formatMessage(level, message, context = null) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    return `[${timestamp}]${contextStr} ${level.toUpperCase()}: ${message}`;
  }

  // Log error messages (always shown)
  error(message, error = null, context = null) {
    const formattedMessage = this.formatMessage(this.LOG_LEVELS.ERROR, message, context);
    console.error(formattedMessage);
    
    if (error) {
      console.error('Error details:', error);
      
      // In production, you might want to send this to an error tracking service
      if (this.isProduction) {
        this.sendToErrorService({ message, error, context });
      }
    }
  }

  // Log warning messages (shown in development and staging)
  warn(message, context = null) {
    if (!this.isProduction) {
      const formattedMessage = this.formatMessage(this.LOG_LEVELS.WARN, message, context);
      console.warn(formattedMessage);
    }
  }

  // Log info messages (shown in development)
  info(message, context = null) {
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(this.LOG_LEVELS.INFO, message, context);
      console.info(formattedMessage);
    }
  }

  // Log debug messages (shown only in development)
  debug(message, data = null, context = null) {
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(this.LOG_LEVELS.DEBUG, message, context);
      console.debug(formattedMessage);
      
      if (data) {
        console.debug('Debug data:', data);
      }
    }
  }

  // Log API calls for debugging
  api(method, url, data = null, context = 'API') {
    if (this.isDevelopment) {
      this.debug(`${method.toUpperCase()} ${url}`, data, context);
    }
  }

  // Log user actions for analytics
  userAction(action, details = null, context = 'USER_ACTION') {
    this.info(`User action: ${action}`, context);
    
    if (details && this.isDevelopment) {
      console.debug('Action details:', details);
    }
    
    // In production, you might want to send this to an analytics service
    if (this.isProduction) {
      this.sendToAnalytics({ action, details });
    }
  }

  // Send errors to external service (placeholder)
  sendToErrorService(errorData) {
    // Implement error tracking service integration here
    // e.g., Sentry, LogRocket, etc.
    console.debug('Would send to error service:', errorData);
  }

  // Send analytics to external service (placeholder)
  sendToAnalytics(analyticsData) {
    // Implement analytics service integration here
    // e.g., Google Analytics, Mixpanel, etc.
    console.debug('Would send to analytics:', analyticsData);
  }
}

// Create and export singleton instance
export const logger = new Logger();

// Export convenience methods
export const logError = (message, error, context) => logger.error(message, error, context);
export const logWarn = (message, context) => logger.warn(message, context);
export const logInfo = (message, context) => logger.info(message, context);
export const logDebug = (message, data, context) => logger.debug(message, data, context);
export const logAPI = (method, url, data, context) => logger.api(method, url, data, context);
export const logUserAction = (action, details, context) => logger.userAction(action, details, context);
