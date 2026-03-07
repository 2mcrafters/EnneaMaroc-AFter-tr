// Slice Redux pour la gestion des utilisateurs
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';
import { User } from './authSlice';
// Import du logout du nouveau simpleAuthSlice pour purger l'état utilisateur
import { logoutAsync } from './simpleAuthSlice';

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

// Types spécifiques aux utilisateurs
export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dob?: string;
  city?: string;
  phone?: string;
  profilePicture?: string;
  role?: 'admin' | 'employee' | 'prof' | 'student';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  dob?: string;
  city?: string;
  phone?: string;
  profilePicture?: string;
  role?: 'admin' | 'employee' | 'prof' | 'student';
  active?: boolean;
}

export interface UserStats {
  total: number;
  students: number;
  profs: number;
  employees: number;
  admins: number;
  active?: number;
  inactive?: number;
}

export interface UserState {
  // Liste des utilisateurs (pour admin/employee)
  users: User[];
  userStats: UserStats | null;
  
  // État du profil utilisateur actuel
  currentUserProfile: User | null;
  
  // États de chargement
  isLoading: boolean;
  isUpdatingProfile: boolean;
  isCreatingUser: boolean;
  
  // Erreurs
  error: string | null;
  profileError: string | null;
  
  // Filtres et recherche
  searchQuery: string;
  roleFilter: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  usersPerPage: number;
}

// État initial
const initialState: UserState = {
  users: [],
  userStats: null,
  currentUserProfile: null,
  isLoading: false,
  isUpdatingProfile: false,
  isCreatingUser: false,
  error: null,
  profileError: null,
  searchQuery: '',
  roleFilter: null,
  currentPage: 1,
  totalPages: 1,
  usersPerPage: 10,
};

// Actions asynchrones

// Récupérer tous les utilisateurs (admin/employee)
export const fetchUsersAsync = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const users = await userService.getAllUsers();
      return users;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

// Créer un nouvel utilisateur
export const createUserAsync = createAsyncThunk(
  'user/createUser',
  async (userData: CreateUserData, { rejectWithValue }) => {
    try {
      const newUser = await userService.createUser(userData);
      return newUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create user');
    }
  }
);

// Mettre à jour un utilisateur
export const updateUserAsync = createAsyncThunk(
  'user/updateUser',
  async (params: { id: number; userData: UpdateUserData }, { rejectWithValue }) => {
    try {
      const updatedUser = await userService.updateUser(params.id, params.userData);
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update user');
    }
  }
);

// Mettre à jour le profil personnel
export const updateProfileAsync = createAsyncThunk(
  'user/updateProfile',
  async (userData: UpdateUserData, { rejectWithValue, dispatch }) => {
    try {
      const response = await userService.updateProfile(userData);
      
      // Mettre à jour aussi l'utilisateur dans le slice auth pour synchronisation
      const normalizedUser = {
        ...response.user,
        name: response.user.firstName || response.user.email || 'User'
      };
      dispatch({ type: 'auth/setUser', payload: normalizedUser });
      
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

// Supprimer un utilisateur
export const deleteUserAsync = createAsyncThunk(
  'user/deleteUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      await userService.deleteUser(userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete user');
    }
  }
);

// Rechercher des utilisateurs
export const searchUsersAsync = createAsyncThunk(
  'user/searchUsers',
  async (params: { query: string; role?: string }, { rejectWithValue }) => {
    try {
      const users = await userService.searchUsers(params.query, params.role);
      return users;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search users');
    }
  }
);

// Récupérer les statistiques des utilisateurs
export const fetchUserStatsAsync = createAsyncThunk(
  'user/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await userService.getUserStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user stats');
    }
  }
);

// Changer le mot de passe
export const changePasswordAsync = createAsyncThunk(
  'user/changePassword',
  async (params: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      await userService.changePassword(params.currentPassword, params.newPassword);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to change password');
    }
  }
);

// Nouvel async thunk pour changer l'email
export const updateEmailAsync = createAsyncThunk(
  'user/updateEmail',
  async (params: { currentPassword: string; newEmail: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await userService.updateEmail(params.currentPassword, params.newEmail);
      
      // Mettre à jour aussi l'utilisateur dans le slice auth pour synchronisation
      const normalizedUser = {
        ...response.user,
        name: response.user.firstName || response.user.email || 'User'
      };
      dispatch({ type: 'auth/setUser', payload: normalizedUser });
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update email');
    }
  }
);

// Nouvel async thunk pour changer le mot de passe
export const updatePasswordAsync = createAsyncThunk(
  'user/updatePassword',
  async (params: { currentPassword: string; newPassword: string; newPasswordConfirmation: string }, { rejectWithValue }) => {
    try {
      const response = await userService.updatePassword(params.currentPassword, params.newPassword, params.newPasswordConfirmation);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update password');
    }
  }
);

// Nouvel async thunk pour changer la photo de profil
export const updateProfilePictureAsync = createAsyncThunk(
  'user/updateProfilePicture',
  async (file: File, { rejectWithValue, dispatch }) => {
    try {
      const response = await userService.updateProfilePicture(file);
      
      // Mettre à jour aussi l'utilisateur dans le slice auth pour synchronisation
      const normalizedUser = {
        ...response.user,
        name: response.user.firstName || response.user.email || 'User'
      };
      dispatch({ type: 'auth/setUser', payload: normalizedUser });
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile picture');
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Actions synchrones
    clearError: (state) => {
      state.error = null;
      state.profileError = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset à la première page
    },
    setRoleFilter: (state, action: PayloadAction<string | null>) => {
      state.roleFilter = action.payload;
      state.currentPage = 1; // Reset à la première page
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setUsersPerPage: (state, action: PayloadAction<number>) => {
      state.usersPerPage = action.payload;
      state.currentPage = 1; // Reset à la première page
    },
    // Mettre à jour un utilisateur localement (optimistic update)
    updateUserLocally: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    // Réinitialiser les utilisateurs
    clearUsers: (state) => {
      state.users = [];
      state.userStats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsersAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.map(normalizeUserData);
        state.error = null;
      })
      .addCase(fetchUsersAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create user
    builder
      .addCase(createUserAsync.pending, (state) => {
        state.isCreatingUser = true;
        state.error = null;
      })
      .addCase(createUserAsync.fulfilled, (state, action) => {
        state.isCreatingUser = false;
        state.users.unshift(normalizeUserData(action.payload)); // Ajouter au début
        state.error = null;
      })
      .addCase(createUserAsync.rejected, (state, action) => {
        state.isCreatingUser = false;
        state.error = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update profile
    builder
      .addCase(updateProfileAsync.pending, (state) => {
        state.isUpdatingProfile = true;
        state.profileError = null;
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        state.currentUserProfile = normalizeUserData(action.payload);
        state.profileError = null;
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.profileError = action.payload as string;
      });

    // Delete user
    builder
      .addCase(deleteUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search users
    builder
      .addCase(searchUsersAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchUsersAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(searchUsersAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchUserStatsAsync.fulfilled, (state, action) => {
        state.userStats = action.payload;
      })
      .addCase(fetchUserStatsAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Change password
    builder
      .addCase(changePasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update email
    builder
      .addCase(updateEmailAsync.pending, (state) => {
        state.isUpdatingProfile = true;
        state.profileError = null;
      })
      .addCase(updateEmailAsync.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        state.profileError = null;
        // Mettre à jour l'utilisateur actuel avec le nouvel email
        state.currentUserProfile = action.payload.user;
      })
      .addCase(updateEmailAsync.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.profileError = action.payload as string;
      });

    // Update password
    builder
      .addCase(updatePasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updatePasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update profile picture
    builder
      .addCase(updateProfilePictureAsync.pending, (state) => {
        state.isUpdatingProfile = true;
        state.profileError = null;
      })
      .addCase(updateProfilePictureAsync.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        state.profileError = null;
        // Mettre à jour l'utilisateur actuel avec la nouvelle photo
        state.currentUserProfile = action.payload.user;
      })
      .addCase(updateProfilePictureAsync.rejected, (state, action) => {
        state.isUpdatingProfile = false;
        state.profileError = action.payload as string;
      })
      // Purge complète lors du logout (peu importe succès ou échec API)
      .addCase(logoutAsync.fulfilled, (state) => {
        state.currentUserProfile = null;
        state.users = [];
        state.userStats = null;
        state.error = null;
        state.profileError = null;
        state.isLoading = false;
        state.isUpdatingProfile = false;
        state.isCreatingUser = false;
        state.searchQuery = '';
        state.roleFilter = null;
        state.currentPage = 1;
        state.totalPages = 1;
      })
      .addCase(logoutAsync.rejected, (state) => {
        state.currentUserProfile = null;
        state.users = [];
        state.userStats = null;
      });
  },
});

// Export des actions
export const {
  clearError,
  setSearchQuery,
  setRoleFilter,
  setCurrentPage,
  setUsersPerPage,
  updateUserLocally,
  clearUsers,
} = userSlice.actions;

// Selectors
export const selectUsers = (state: { user: UserState }) => state.user.users;
export const selectUserStats = (state: { user: UserState }) => state.user.userStats;
export const selectCurrentUserProfile = (state: { user: UserState }) => state.user.currentUserProfile;
export const selectUserLoading = (state: { user: UserState }) => state.user.isLoading;
export const selectProfileLoading = (state: { user: UserState }) => state.user.isUpdatingProfile;
export const selectUserError = (state: { user: UserState }) => state.user.error;
export const selectProfileError = (state: { user: UserState }) => state.user.profileError;
export const selectSearchQuery = (state: { user: UserState }) => state.user.searchQuery;
export const selectRoleFilter = (state: { user: UserState }) => state.user.roleFilter;
// Nouveau sélecteur pour les instructeurs/professeurs
export const selectInstructors = (state: { user: UserState }) => 
  state.user.users.filter(user => user.role === 'prof');

export default userSlice.reducer;