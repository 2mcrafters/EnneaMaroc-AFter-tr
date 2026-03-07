// Slice Redux pour l'interface utilisateur (UI)
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  autoHide?: boolean;
  duration?: number; // en ms
}

export interface Modal {
  isOpen: boolean;
  type: 'confirm' | 'info' | 'form' | 'custom';
  title?: string;
  content?: string;
  data?: any;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface LoadingState {
  global: boolean;
  auth: boolean;
  users: boolean;
  courses: boolean;
  upload: boolean;
  [key: string]: boolean;
}

export interface UIState {
  // Navigation
  currentPath: string;
  breadcrumbs: Array<{ label: string; path?: string }>;
  
  // Sidebar (pour dashboard admin/prof)
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Notifications/Toasts
  notifications: Notification[];
  
  // Modales
  modal: Modal;
  
  // États de chargement
  loading: LoadingState;
  
  // Thème et apparence
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  
  // Recherche globale
  globalSearchOpen: boolean;
  globalSearchQuery: string;
  
  // Filtres globaux
  showFilters: boolean;
  
  // Vue liste/grille
  viewMode: 'list' | 'grid' | 'table';
  
  // Erreurs globales
  globalError: string | null;
  
  // État de connection/déconnection
  isOnline: boolean;
  
  // Scroll positions pour restaurer la position
  scrollPositions: { [path: string]: number };
}

const initialState: UIState = {
  currentPath: '/',
  breadcrumbs: [],
  sidebarOpen: false,
  sidebarCollapsed: false,
  notifications: [],
  modal: {
    isOpen: false,
    type: 'info',
  },
  loading: {
    global: false,
    auth: false,
    users: false,
    courses: false,
    upload: false,
  },
  theme: 'light',
  fontSize: 'medium',
  globalSearchOpen: false,
  globalSearchQuery: '',
  showFilters: false,
  viewMode: 'grid',
  globalError: null,
  isOnline: navigator.onLine,
  scrollPositions: {},
};

// Utility function pour générer un ID unique
const generateId = () => Math.random().toString(36).substr(2, 9);

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Navigation
    setCurrentPath: (state, action: PayloadAction<string>) => {
      state.currentPath = action.payload;
    },
    setBreadcrumbs: (state, action: PayloadAction<Array<{ label: string; path?: string }>>) => {
      state.breadcrumbs = action.payload;
    },
    
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: generateId(),
        timestamp: Date.now(),
        autoHide: action.payload.autoHide ?? true,
        duration: action.payload.duration ?? 5000,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Notifications helpers
    showSuccess: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        id: generateId(),
        type: 'success',
        title: action.payload.title,
        message: action.payload.message,
        timestamp: Date.now(),
        autoHide: true,
        duration: 5000,
      };
      state.notifications.push(notification);
    },
    showError: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        id: generateId(),
        type: 'error',
        title: action.payload.title,
        message: action.payload.message,
        timestamp: Date.now(),
        autoHide: false, // Les erreurs ne se cachent pas automatiquement
      };
      state.notifications.push(notification);
    },
    showWarning: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        id: generateId(),
        type: 'warning',
        title: action.payload.title,
        message: action.payload.message,
        timestamp: Date.now(),
        autoHide: true,
        duration: 7000,
      };
      state.notifications.push(notification);
    },
    showInfo: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        id: generateId(),
        type: 'info',
        title: action.payload.title,
        message: action.payload.message,
        timestamp: Date.now(),
        autoHide: true,
        duration: 5000,
      };
      state.notifications.push(notification);
    },
    
    // Modales
    openModal: (state, action: PayloadAction<Omit<Modal, 'isOpen'>>) => {
      state.modal = {
        ...action.payload,
        isOpen: true,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: 'info',
      };
    },
    
    // États de chargement
    setLoading: (state, action: PayloadAction<{ key: keyof LoadingState; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    
    // Thème
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
      localStorage.setItem('fontSize', action.payload);
    },
    
    // Recherche globale
    toggleGlobalSearch: (state) => {
      state.globalSearchOpen = !state.globalSearchOpen;
      if (!state.globalSearchOpen) {
        state.globalSearchQuery = '';
      }
    },
    setGlobalSearchQuery: (state, action: PayloadAction<string>) => {
      state.globalSearchQuery = action.payload;
    },
    
    // Filtres
    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },
    setShowFilters: (state, action: PayloadAction<boolean>) => {
      state.showFilters = action.payload;
    },
    
    // Vue
    setViewMode: (state, action: PayloadAction<'list' | 'grid' | 'table'>) => {
      state.viewMode = action.payload;
      localStorage.setItem('viewMode', action.payload);
    },
    
    // Erreurs globales
    setGlobalError: (state, action: PayloadAction<string | null>) => {
      state.globalError = action.payload;
    },
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    
    // État de connexion
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    
    // Scroll positions
    saveScrollPosition: (state, action: PayloadAction<{ path: string; position: number }>) => {
      state.scrollPositions[action.payload.path] = action.payload.position;
    },
    
    // Restaurer préférences depuis localStorage
    restoreUIPreferences: (state) => {
      const theme = localStorage.getItem('theme') as 'light' | 'dark';
      const fontSize = localStorage.getItem('fontSize') as 'small' | 'medium' | 'large';
      const viewMode = localStorage.getItem('viewMode') as 'list' | 'grid' | 'table';
      
      if (theme) state.theme = theme;
      if (fontSize) state.fontSize = fontSize;
      if (viewMode) state.viewMode = viewMode;
    },
    
    // Reset UI state
    resetUIState: (state) => {
      state.notifications = [];
      state.modal.isOpen = false;
      state.globalError = null;
      state.globalSearchOpen = false;
      state.globalSearchQuery = '';
      state.showFilters = false;
    },
  },
});

// Export des actions
export const {
  setCurrentPath,
  setBreadcrumbs,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  addNotification,
  removeNotification,
  clearNotifications,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  openModal,
  closeModal,
  setLoading,
  setGlobalLoading,
  setTheme,
  toggleTheme,
  setFontSize,
  toggleGlobalSearch,
  setGlobalSearchQuery,
  toggleFilters,
  setShowFilters,
  setViewMode,
  setGlobalError,
  clearGlobalError,
  setOnlineStatus,
  saveScrollPosition,
  restoreUIPreferences,
  resetUIState,
} = uiSlice.actions;

// Selectors
export const selectCurrentPath = (state: { ui: UIState }) => state.ui.currentPath;
export const selectBreadcrumbs = (state: { ui: UIState }) => state.ui.breadcrumbs;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state: { ui: UIState }) => state.ui.sidebarCollapsed;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectModal = (state: { ui: UIState }) => state.ui.modal;
export const selectLoading = (state: { ui: UIState }) => state.ui.loading;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectViewMode = (state: { ui: UIState }) => state.ui.viewMode;
export const selectGlobalError = (state: { ui: UIState }) => state.ui.globalError;
export const selectIsOnline = (state: { ui: UIState }) => state.ui.isOnline;

export default uiSlice.reducer;