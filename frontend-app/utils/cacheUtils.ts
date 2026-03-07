// Version management for cache busting in private browsing
export const APP_VERSION = Date.now().toString();

// Force reload if version changed
export const checkAppVersion = () => {
  const stored = localStorage.getItem('app_version');
  if (stored !== APP_VERSION) {
    localStorage.setItem('app_version', APP_VERSION);
    // Clear relevant cache
    localStorage.removeItem('courses');
    localStorage.removeItem('users');
    console.log('🔄 App version updated, cache cleared');
  }
};

// Add timestamp to prevent caching
export const addCacheBuster = (url: string) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}`;
};
