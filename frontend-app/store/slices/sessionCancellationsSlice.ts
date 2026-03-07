import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sessionCancellationsService, SessionCancellation, SessionCancellationPayload } from '../../services/sessionCancellationsService';

type State = {
  items: SessionCancellation[];
  loading: boolean;
  error: string | null;
};

const initialState: State = { items: [], loading: false, error: null };

export const fetchSessionCancellations = createAsyncThunk(
  'sessionCancellations/fetchAll',
  async ({ from, to }: { from?: string; to?: string } = {}) => {
    const data = await sessionCancellationsService.list(from, to);
    return data;
  }
);

export const createSessionCancellation = createAsyncThunk(
  'sessionCancellations/create',
  async (payload: SessionCancellationPayload) => {
    const created = await sessionCancellationsService.create(payload);
    return created;
  }
);

export const deleteSessionCancellation = createAsyncThunk(
  'sessionCancellations/delete',
  async (id: number) => {
    await sessionCancellationsService.remove(id);
    return id;
  }
);

const slice = createSlice({
  name: 'sessionCancellations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionCancellations.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchSessionCancellations.fulfilled, (s, a: PayloadAction<SessionCancellation[]>) => {
        s.loading = false; s.items = a.payload;
      })
      .addCase(fetchSessionCancellations.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Failed to load'; })
      .addCase(createSessionCancellation.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createSessionCancellation.fulfilled, (s, a: PayloadAction<SessionCancellation>) => {
        s.loading = false; s.items.unshift(a.payload);
      })
      .addCase(createSessionCancellation.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Failed to create'; })
      .addCase(deleteSessionCancellation.fulfilled, (s, a: PayloadAction<number>) => {
        s.items = s.items.filter(i => i.id !== a.payload);
      });
  }
});

export default slice.reducer;

// Selectors
export const selectSessionCancellations = (state: any) => (state.sessionCancellations as State).items;
export const selectSessionCancellationsLoading = (state: any) => (state.sessionCancellations as State).loading;
export const selectSessionCancellationsError = (state: any) => (state.sessionCancellations as State).error;
