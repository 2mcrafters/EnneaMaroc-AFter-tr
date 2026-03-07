import { AppDispatch } from '../store';
import { forceRefreshAllData, refreshUserData } from './dataPreloader';

/**
 * Handler for page refresh events
 * This function sets up listeners to detect page refreshes and reload data
 */
export const setupPageRefreshHandler = (dispatch: AppDispatch) => {
  console.log('🔄 Setting up page refresh handler');
  
  // Store the last visit timestamp in localStorage (persists across refreshes)
  const setLastVisitTime = () => {
    localStorage.setItem('lastVisitTime', Date.now().toString());
  };

  // Check if this is a page refresh (not first load or navigation)
  const checkIfRefresh = () => {
    const lastVisitTime = localStorage.getItem('lastVisitTime');
    const userInfo = localStorage.getItem('user');
    
    // If user is logged in and we have a last visit time, it's likely a refresh
    if (lastVisitTime && userInfo) {
      try {
        const user = JSON.parse(userInfo);
        const timeSinceLastVisit = Date.now() - parseInt(lastVisitTime);
        
        // If the time since last visit is less than 5 seconds, it's likely a refresh
        // Rather than a return visit after closing the browser
        if (timeSinceLastVisit < 5000) {
          console.log('🔄 Page refresh detected, reloading all data');
          
          if (user.role === 'student') {
            console.log('🧑‍🎓 Student refresh detected - ensuring enrollments and payments are refreshed');
          }
          
          // Force data refresh
          forceRefreshAllData(dispatch, user.role, user.id).then(success => {
            if (success) {
              console.log('✅ Data refreshed successfully after page reload');
              
              // Pour les étudiants, assurons-nous que les inscriptions et paiements sont actualisés
              if (user.role === 'student') {
                // Double-check pour s'assurer que les données étudiants sont bien chargées
                refreshUserData(dispatch, user.id).then(() => {
                  console.log('✅ Student-specific data refreshed additionally');
                });
              }
            } else {
              console.error('❌ Failed to refresh data after page reload');
            }
          });
        } else {
          console.log('🔄 Return visit detected, not refreshing data automatically');
        }
      } catch (error) {
        console.error('❌ Error processing user data during refresh check', error);
      }
    }
    
    // Update the last visit time
    setLastVisitTime();
  };

  // Set initial visit time
  setLastVisitTime();
  
  // Setup event listener for page visibility changes
  // This is more reliable than beforeunload/load for detecting refreshes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkIfRefresh();
    }
  });

  // Also check on load
  window.addEventListener('load', checkIfRefresh);
  
  return {
    // Function to manually trigger a data refresh
    refreshAllData: () => {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          return forceRefreshAllData(dispatch, user.role, user.id);
        } catch (error) {
          console.error('❌ Error refreshing data', error);
          return Promise.resolve(false);
        }
      }
      return Promise.resolve(false);
    }
  };
};

// Export a helper for adding a refresh button to pages
export const createRefreshButton = (refreshFn: () => Promise<boolean>) => {
  const refreshData = async () => {
    const button = document.getElementById('refresh-data-button');
    if (button) {
      button.setAttribute('disabled', 'true');
      button.innerHTML = '<span class="animate-spin">⟳</span> Actualisation...';
    }
    
    const success = await refreshFn();
    
    if (button) {
      button.removeAttribute('disabled');
      button.innerHTML = '⟳ Actualiser les Données';
      
      // Visual feedback on success/failure
      if (success) {
        button.classList.add('success');
        setTimeout(() => button.classList.remove('success'), 1500);
      } else {
        button.classList.add('error');
        setTimeout(() => button.classList.remove('error'), 1500);
      }
    }
  };
  
  return (
    <button 
      id="refresh-data-button"
      onClick={refreshData}
      className="px-3 py-1 rounded bg-slate-100 text-slate-700 hover:bg-[#e13734] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e13734]"
    >
      ⟳ Refresh Data
    </button>
  );
};