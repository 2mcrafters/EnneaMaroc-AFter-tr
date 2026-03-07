import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Parcours, parcoursService } from '../../services/parcoursService';

interface ParcoursState {
  items: Parcours[];
  currentItem: Parcours | null;
  loading: boolean;
  error: string | null;
}

const initialState: ParcoursState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
};

export const fetchAllParcours = createAsyncThunk(
  'parcours/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await parcoursService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch parcours');
    }
  }
);

export const fetchParcoursBySlug = createAsyncThunk(
  'parcours/fetchBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      return await parcoursService.getBySlug(slug);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch parcours');
    }
  }
);

export const updateParcours = createAsyncThunk(
  'parcours/update',
  async ({ id, data }: { id: number; data: Partial<Parcours> }, { rejectWithValue }) => {
    try {
      return await parcoursService.update(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update parcours');
    }
  }
);

export const createParcours = createAsyncThunk(
  'parcours/create',
  async (data: Partial<Parcours>, { rejectWithValue }) => {
    try {
      return await parcoursService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create parcours');
    }
  }
);

export const deleteParcours = createAsyncThunk(
  'parcours/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await parcoursService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete parcours');
    }
  }
);

const parcoursSlice = createSlice({
  name: 'parcours',
  initialState,
  reducers: {
    clearCurrentParcours: (state) => {
      state.currentItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllParcours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllParcours.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllParcours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch By Slug
      .addCase(fetchParcoursBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParcoursBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchParcoursBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateParcours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateParcours.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateParcours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createParcours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createParcours.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createParcours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteParcours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteParcours.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteParcours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentParcours } = parcoursSlice.actions;
export default parcoursSlice.reducer;
