// Slice Redux pour l'authentification
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

// Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'employee' | 'prof' | 'student';
  profilePicture?: string;
  dob?: string;
  city?: string;
  phone?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
}

// État initial
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,
  lastActivity: Date.now(),
};

// Actions asynchrones avec createAsyncThunk
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials.email, credentials.password);
      
      // Stocker le token dans localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      
      // Nettoyer le localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isAuthenticated');
      
      return null;
    } catch (error: any) {
      // Même en cas d'erreur, on nettoie le localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isAuthenticated');
      
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get current user');
    }
  }
);

export const refreshTokenAsync = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      localStorage.setItem('auth_token', response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Actions synchrones
    clearError: (state) => {
      state.error = null;
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('currentUser', JSON.stringify(action.payload));
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isAuthenticated');
    },
    // Restaurer l'état depuis localStorage au démarrage
    restoreAuthState: (state) => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('currentUser');
      
      if (token && userData) {
        state.token = token;
        state.user = JSON.parse(userData);
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.lastActivity = Date.now();
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.isLoading = false;
        // Même en cas d'erreur, on déconnecte l'utilisateur
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Get current user
    builder
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Si on ne peut pas récupérer l'utilisateur, déconnecter
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('currentUser');
      });

    // Refresh token
    builder
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.token = action.payload.token;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(refreshTokenAsync.rejected, (state) => {
        // Si le refresh échoue, déconnecter
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('currentUser');
      });
  },
});

// Export des actions
export const { 
  clearError, 
  updateLastActivity, 
  setUser, 
  clearAuth, 
  restoreAuthState 
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;

export default authSlice.reducer;