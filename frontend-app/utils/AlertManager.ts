import Swal from 'sweetalert2';
import '../styles/sweetalert-custom.css';

export interface AlertConfig {
  title: string;
  message: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
  autoClose?: boolean;
  duration?: number;
}

export class AlertManager {
  /**
   * Show error alert with custom styling
   */
  static showError(config: AlertConfig) {
    return Swal.fire({
      icon: 'error',
      title: config.title,
      text: config.message,
      footer: config.details ? `<small style="color: #6b7280;">${config.details}</small>` : undefined,
      confirmButtonColor: '#dc2626',
      confirmButtonText: config.confirmText || 'D\'accord',
      background: '#ffffff',
      color: '#1e293b',
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      },
      customClass: {
        popup: 'rounded-2xl shadow-xl',
        confirmButton: 'px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all'
      }
    });
  }

  /**
   * Show success alert with custom styling
   */
  static showSuccess(config: AlertConfig) {
    return Swal.fire({
      icon: 'success',
      title: config.title,
      text: config.message,
      confirmButtonColor: '#059669',
      confirmButtonText: config.confirmText || 'Parfait !',
      background: '#ffffff',
      color: '#1e293b',
      timer: config.autoClose !== false ? (config.duration || 3000) : undefined,
      timerProgressBar: config.autoClose !== false,
      showConfirmButton: config.autoClose === false,
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      },
      customClass: {
        popup: 'rounded-2xl shadow-xl',
        confirmButton: 'px-6 py-2.5 rounded-xl font-medium shadow-green-500/30 hover:shadow-green-500/40 transition-all'
      }
    });
  }

  /**
   * Show warning/confirmation alert
   */
  static showConfirmation(config: AlertConfig) {
    return Swal.fire({
      icon: 'warning',
      title: config.title,
      text: config.message,
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: config.confirmText || 'Oui, continuer !',
      cancelButtonText: config.cancelText || 'Annuler',
      background: '#ffffff',
      color: '#1e293b',
      reverseButtons: true,
      customClass: {
        popup: 'animated pulse',
        confirmButton: 'hover-scale',
        cancelButton: 'hover-scale'
      }
    });
  }

  /**
   * Show info alert
   */
  static showInfo(config: AlertConfig) {
    return Swal.fire({
      icon: 'info',
      title: config.title,
      text: config.message,
      confirmButtonColor: '#0ea5e9',
      confirmButtonText: config.confirmText || 'OK',
      background: '#ffffff',
      color: '#1e293b',
      timer: config.autoClose !== false ? (config.duration || 5000) : undefined,
      timerProgressBar: config.autoClose !== false,
      showConfirmButton: config.autoClose === false,
      customClass: {
        popup: 'animated fadeIn',
        confirmButton: 'hover-scale'
      }
    });
  }

  /**
   * Show loading alert
   */
  static showLoading(message: string) {
    return Swal.fire({
      title: 'Processing...',
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: '#ffffff',
      color: '#1e293b',
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Close any open Swal dialog
   */
  static close() {
    Swal.close();
  }

  /**
   * Payment specific alerts
   */
  static payments = {
    confirmPayment: (amount: number, userName: string) => 
      AlertManager.showConfirmation({
        title: 'Confirm Payment',
        message: `Are you sure you want to confirm the payment of ${amount.toLocaleString('de-DE')} MAD from ${userName}?`,
        confirmText: 'Yes, confirm it!',
        cancelText: 'Cancel'
      }),

    rejectPayment: (amount: number, userName: string) => 
      AlertManager.showConfirmation({
        title: 'Reject Payment?',
        message: `Are you sure you want to reject the payment of ${amount.toLocaleString('de-DE')} MAD from ${userName}? This action cannot be undone.`,
        confirmText: 'Yes, reject it!',
        cancelText: 'Keep payment'
      }),

    revertToPending: (amount: number, userName: string) => 
      AlertManager.showConfirmation({
        title: 'Revert to Pending?',
        message: `Are you sure you want to revert the payment of ${amount.toLocaleString('de-DE')} MAD from ${userName} back to pending status?`,
        confirmText: 'Yes, revert it!',
        cancelText: 'Keep confirmed'
      }),

    paymentConfirmed: (amount: number, userName: string) => 
      AlertManager.showSuccess({
        title: 'Payment Confirmed! 🎉',
        message: `Payment of ${amount.toLocaleString('de-DE')} MAD has been successfully confirmed for ${userName}.`
      }),

    paymentRejected: (amount: number) => 
      AlertManager.showSuccess({
        title: 'Payment Rejected',
        message: `Payment of ${amount.toLocaleString('de-DE')} MAD has been rejected successfully.`
      }),

    paymentCreated: (amount: number, userName: string, month: number) => 
      AlertManager.showSuccess({
        title: 'Payment Added Successfully! 💰',
        message: `Manual payment of ${amount.toLocaleString('de-DE')} MAD has been created for ${userName} - Month ${month}.`,
        autoClose: false
      }),

    paymentAlreadyExists: (month: number) => 
      AlertManager.showError({
        title: 'Payment Already Exists',
        message: `A payment for month ${month} already exists for this enrollment.`,
        details: 'Please check the payment history or select a different month.',
        confirmText: 'Got it'
      }),

    invalidPaymentData: () => 
      AlertManager.showError({
        title: 'Missing Information',
        message: 'Please fill in all required fields before submitting.'
      }),

    invalidSelection: () => 
      AlertManager.showError({
        title: 'Invalid Selection',
        message: 'Please select a valid enrollment and user combination.'
      })
  };

  /**
   * General operation alerts
   */
  static operations = {
    loading: (operation: string) => AlertManager.showLoading(`${operation}...`),
    
    failed: (operation: string, error: string) => 
      AlertManager.showError({
        title: `${operation} Failed`,
        message: `Unable to complete the operation. Please try again.`,
        details: `Error: ${error}`
      }),
    
    succeeded: (operation: string, details?: string) => 
      AlertManager.showSuccess({
        title: `${operation} Successful`,
        message: details || 'The operation completed successfully.'
      })
  };

  /**
   * Authentification alerts
   */
  static auth = {
    loginFailed: (errorMessage: string) =>
      AlertManager.showError({
        title: 'Login Failed',
        message: errorMessage || 'Please check your credentials',
        confirmText: 'Try Again',
      }),
    
    loginSuccess: (userName: string) =>
      AlertManager.showSuccess({
        title: 'Login Successful',
        message: `Welcome ${userName}!`,
        autoClose: true,
        duration: 2000,
      }),
      
    logoutSuccess: () =>
      AlertManager.showSuccess({
        title: 'Logout Successful',
        message: 'You have been successfully logged out',
        autoClose: true,
        duration: 2000,
      }),
      
    sessionExpired: () =>
      AlertManager.showInfo({
        title: 'Session Expired',
        message: 'Your session has expired, please log in again',
        confirmText: 'Log In Again',
      }),
  };


}

export default AlertManager;