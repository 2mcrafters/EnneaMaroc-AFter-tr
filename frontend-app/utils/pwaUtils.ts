// Utilitaires pour détecter et gérer l'état PWA
export const isPWA = (): boolean => {
  // Vérifier si l'app est dans un standalone mode
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
};

export const isInstallable = (): boolean => {
  // Vérifier si le navigateur supporte l'installation PWA
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const getInstallPrompt = (): any => {
  // Récupérer le prompt d'installation s'il est disponible
  return (window as any).deferredPrompt;
};

export const getDisplayMode = (): string => {
  if (isPWA()) {
    return 'standalone';
  }
  
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  
  return 'browser';
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const getConnectionType = (): string => {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  if (!connection) {
    return 'unknown';
  }
  
  return connection.effectiveType || connection.type || 'unknown';
};

export const shouldSyncAggressively = (): boolean => {
  const connection = getConnectionType();
  const isGoodConnection = ['4g', 'wifi', 'ethernet'].includes(connection);
  return isOnline() && isGoodConnection;
};

// Hook pour utiliser les informations PWA
export const usePWAInfo = () => {
  const [installPrompt, setInstallPrompt] = React.useState<any>(null);
  const [displayMode, setDisplayMode] = React.useState<string>(getDisplayMode());
  const [connectionType, setConnectionType] = React.useState<string>(getConnectionType());
  const [online, setOnline] = React.useState<boolean>(isOnline());

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setDisplayMode('standalone');
    };

    const handleDisplayModeChange = () => {
      setDisplayMode(getDisplayMode());
    };

    const handleConnectionChange = () => {
      setConnectionType(getConnectionType());
    };

    const handleOnlineStatusChange = () => {
      setOnline(isOnline());
    };

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('resize', handleDisplayModeChange);
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }
    
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('resize', handleDisplayModeChange);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return false;

    try {
      installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
        return true;
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
    
    return false;
  };

  return {
    isPWA: isPWA(),
    isInstallable: isInstallable(),
    installPrompt,
    displayMode,
    connectionType,
    online,
    shouldSyncAggressively: shouldSyncAggressively(),
    install
  };
};

// Import React pour le hook
import React from 'react';