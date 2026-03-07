import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { forceRefreshAllData } from '../utils/dataPreloader';

interface RefreshButtonProps {
  className?: string;
  compact?: boolean;
  showText?: boolean;
  onRefreshComplete?: (success: boolean) => void;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ 
  className = '', 
  compact = false,
  showText = true,
  onRefreshComplete
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastRefreshResult, setLastRefreshResult] = React.useState<'success' | 'error' | null>(null);
  
  const handleRefresh = async () => {
    if (isRefreshing || !user) return;
    
    setIsRefreshing(true);
    setLastRefreshResult(null);
    
    try {
      const success = await forceRefreshAllData(dispatch, user.role, user.id);
      
      setLastRefreshResult(success ? 'success' : 'error');
      
      if (onRefreshComplete) {
        onRefreshComplete(success);
      }
      
      // Reset status after a delay
      setTimeout(() => {
        setLastRefreshResult(null);
      }, 3000);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setLastRefreshResult('error');
      
      if (onRefreshComplete) {
        onRefreshComplete(false);
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  
  let buttonClasses = `inline-flex items-center justify-center rounded-md transition-all 
    ${compact ? 'p-1' : 'px-3 py-2'} 
    ${isRefreshing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e13734] hover:text-white active:bg-[#c12e2c]'} 
    ${lastRefreshResult === 'success' ? 'bg-green-100 text-green-800' : ''} 
    ${lastRefreshResult === 'error' ? 'bg-red-100 text-red-800' : ''} 
    ${!lastRefreshResult ? 'bg-slate-100 text-slate-700' : ''}
    ${className}`;
  
  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={buttonClasses}
      aria-label="Actualiser les données"
      title="Actualiser toutes les données"
    >
      <span className={`${isRefreshing ? 'animate-spin' : ''} inline-block`}>
        ⟳
      </span>
      
      {showText && (
        <span className={compact ? 'sr-only' : 'ml-1'}>
          {isRefreshing ? 'Actualisation...' : 'Actualiser les Données'}
        </span>
      )}
    </button>
  );
};

export default RefreshButton;