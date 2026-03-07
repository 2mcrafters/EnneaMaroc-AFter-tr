import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

// Fonction utilitaire pour formater la date (enlever l'heure)
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  // Si la date contient 'T', on prend seulement la partie avant 'T'
  return dateString.split('T')[0];
};

// Fonction pour normaliser les données utilisateur
const normalizeUserData = (user: any): User => {
  return {
    ...user,
    dob: user.dob ? formatDate(user.dob) : user.dob,
  };
};

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'student' | 'prof';
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  dob?: string;
  city?: string;
  phone?: string;
  hasPaidRegistrationFee?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks pour l'authentification
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials.email, credentials.password);
      
      // Mettre à jour localStorage pour compatibilité avec l'App existante
      localStorage.setItem('token', response.token);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', response.user.role);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Déclencher un événement pour notifier l'App du changement
      window.dispatchEvent(new Event('storage_change'));
      
      return response;
    } catch (error: any) {
      // Extraction plus détaillée des messages d'erreur
      const errorResponse = error.response?.data;
      let errorMessage = 'Connection error';
      
      if (errorResponse) {
        if (errorResponse.message) {
          errorMessage = errorResponse.message;
        } 
        // Si l'API renvoie des erreurs spécifiques par champ
        else if (errorResponse.errors) {
          // Priorité aux erreurs liées à l'email ou au mot de passe
          if (errorResponse.errors.email && errorResponse.errors.email.length) {
            errorMessage = errorResponse.errors.email[0];
          } else if (errorResponse.errors.password && errorResponse.errors.password.length) {
            errorMessage = errorResponse.errors.password[0];
          } else {
            // Prendre le premier message d'erreur disponible
            const firstErrorField = Object.keys(errorResponse.errors)[0];
            if (firstErrorField && errorResponse.errors[firstErrorField].length) {
              errorMessage = errorResponse.errors[firstErrorField][0];
            }
          }
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const signupAsync = createAsyncThunk(
  'auth/signup',
  async (userData: { firstName: string; lastName: string; email: string; password: string; [key: string]: any }, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData.firstName, userData.lastName, userData.email, userData.password, userData);
      
      // Mettre à jour localStorage pour compatibilité avec l'App existante
      localStorage.setItem('token', response.token);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', response.user.role);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Déclencher un événement pour notifier l'App du changement
      window.dispatchEvent(new Event('storage_change'));
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur d\'inscription');
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      
      // Nettoyer tout le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      
      // Déclencher un événement pour notifier l'App du changement
      window.dispatchEvent(new Event('storage_change'));
      
      return null;
    } catch (error: any) {
      // Nettoyer localStorage même en cas d'erreur
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      
      // Déclencher un événement pour notifier l'App du changement
      window.dispatchEvent(new Event('storage_change'));
      
      return rejectWithValue(error.response?.data?.message || 'Erreur de déconnexion');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    restoreAuthState: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = normalizeUserData(action.payload.user);
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = normalizeUserData(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = normalizeUserData(action.payload.user);
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Signup
      .addCase(signupAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = normalizeUserData(action.payload.user);
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signupAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Logout
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Force logout même en cas d'erreur API
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, restoreAuthState, resetAuth, setUser } = authSlice.actions;

// Sélecteurs
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;