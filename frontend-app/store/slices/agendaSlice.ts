import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { agendaService, ParcoursSession } from '../../services/agendaService';

interface AgendaState {
  sessions: ParcoursSession[];
  loading: boolean;
  error: string | null;
}

const initialState: AgendaState = {
  sessions: [],
  loading: false,
  error: null,
};

export const fetchSessions = createAsyncThunk(
  'agenda/fetchSessions',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      return await agendaService.getAllSessions(startDate, endDate);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors du chargement de l\'agenda');
    }
  }
);

export const createSession = createAsyncThunk(
  'agenda/createSession',
  async (data: Partial<ParcoursSession>, { rejectWithValue }) => {
    try {
      return await agendaService.createSession(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de la création de la session');
    }
  }
);

export const updateSession = createAsyncThunk(
  'agenda/updateSession',
  async ({ id, data }: { id: number; data: Partial<ParcoursSession> }, { rejectWithValue }) => {
    try {
      return await agendaService.updateSession(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de la mise à jour de la session');
    }
  }
);

export const deleteSession = createAsyncThunk(
  'agenda/deleteSession',
  async (id: number, { rejectWithValue }) => {
    try {
      await agendaService.deleteSession(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de la suppression de la session');
    }
  }
);

const agendaSlice = createSlice({
  name: 'agenda',
  initialState,
  reducers: {
    clearAgendaError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createSession.fulfilled, (state, action) => {
        state.sessions.push(action.payload);
      })
      // Update
      .addCase(updateSession.fulfilled, (state, action) => {
        const index = state.sessions.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(s => s.id !== action.payload);
      });
  },
});

export const { clearAgendaError } = agendaSlice.actions;
export default agendaSlice.reducer;
