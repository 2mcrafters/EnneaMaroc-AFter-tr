import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import paymentService, { 
  Payment, 
  CreatePaymentData, 
  UpdatePaymentData, 
  PaymentStats, 
  PaymentStatus 
} from '../../services/paymentService';

// Re-export the types for easier access
export type { Payment, CreatePaymentData, UpdatePaymentData, PaymentStats, PaymentStatus };

// Async thunks pour les actions asynchrones
export const fetchAllPayments = createAsyncThunk(
  'payments/fetchAll',
  async () => {
    return await paymentService.getAllPayments();
  }
);

export const fetchEnrollmentPayments = createAsyncThunk(
  'payments/fetchByEnrollment',
  async (enrollmentId: number) => {
    return await paymentService.getEnrollmentPayments(enrollmentId);
  }
);

export const fetchUserPayments = createAsyncThunk(
  'payments/fetchByUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      const payments = await paymentService.getUserPayments(userId);
      console.log(`[paymentsSlice] fetchUserPayments(${userId}) got ${payments.length} items`);
      return payments;
    } catch (error) {
      console.error(`[paymentsSlice] fetchUserPayments(${userId}) failed:`, error);
      return rejectWithValue(error);
    }
  }
);

export const createPayment = createAsyncThunk(
  'payments/create',
  async (data: CreatePaymentData) => {
    return await paymentService.createPayment(data);
  }
);

export const updatePayment = createAsyncThunk(
  'payments/update',
  async ({ id, data }: { id: number; data: UpdatePaymentData }) => {
    return await paymentService.updatePayment(id, data);
  }
);

export const deletePayment = createAsyncThunk(
  'payments/delete',
  async (id: number) => {
    await paymentService.deletePayment(id);
    return id;
  }
);

export const confirmPayment = createAsyncThunk(
  'payments/confirm',
  async (id: number) => {
    return await paymentService.confirmPayment(id);
  }
);

export const rejectPayment = createAsyncThunk(
  'payments/reject',
  async (id: number) => {
    return await paymentService.rejectPayment(id);
  }
);

export const fetchPaymentStats = createAsyncThunk(
  'payments/fetchStats',
  async () => {
    return await paymentService.getPaymentStats();
  }
);

interface PaymentsState {
  payments: Payment[];
  enrollmentPayments: Record<number, Payment[]>; // payments by enrollment id
  userPayments: Record<number, Payment[]>; // payments by user id
  stats: PaymentStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  payments: [],
  enrollmentPayments: {},
  userPayments: {},
  stats: null,
  loading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPayments: (state) => {
      state.payments = [];
      state.enrollmentPayments = {};
      state.userPayments = {};
    },
    // Action pour mettre à jour un payment localement
    updatePaymentStatus: (state, action: PayloadAction<{ id: number; status: PaymentStatus }>) => {
      const { id, status } = action.payload;
      
      // Update in main payments array
      const payment = state.payments.find(p => p.id === id);
      if (payment) {
        payment.status = status;
      }
      
      // Update in enrollment payments
      Object.values(state.enrollmentPayments).forEach(payments => {
        const enrollmentPayment = payments.find(p => p.id === id);
        if (enrollmentPayment) {
          enrollmentPayment.status = status;
        }
      });
      
      // Update in user payments
      Object.values(state.userPayments).forEach(payments => {
        const userPayment = payments.find(p => p.id === id);
        if (userPayment) {
          userPayment.status = status;
        }
      });
    },
  },
  extraReducers: (builder) => {
    // Fetch all payments
    builder
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payments';
      });

    // Fetch enrollment payments
    builder
      .addCase(fetchEnrollmentPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentPayments.fulfilled, (state, action) => {
        state.loading = false;
        const enrollmentId = action.meta.arg;
        state.enrollmentPayments[enrollmentId] = action.payload;
      })
      .addCase(fetchEnrollmentPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch enrollment payments';
      });

    // Fetch user payments
    builder
      .addCase(fetchUserPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPayments.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.meta.arg;
        state.userPayments[userId] = action.payload;
      })
      .addCase(fetchUserPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user payments';
      });

    // Create payment
    builder
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action: PayloadAction<Payment>) => {
        state.loading = false;
        const newPayment = action.payload;
        
        // Add to main payments array
        state.payments.push(newPayment);
        
        // Add to enrollment payments
        if (state.enrollmentPayments[newPayment.enrollment_id]) {
          state.enrollmentPayments[newPayment.enrollment_id].push(newPayment);
        }
        
        // Add to user payments if we have enrollment data
        if (newPayment.enrollment?.user_id && state.userPayments[newPayment.enrollment.user_id]) {
          state.userPayments[newPayment.enrollment.user_id].push(newPayment);
        }
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create payment';
      });

    // Update payment
    builder
      .addCase(updatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, action: PayloadAction<Payment>) => {
        state.loading = false;
        const updatedPayment = action.payload;
        
        // Update in main payments array
        const index = state.payments.findIndex(p => p.id === updatedPayment.id);
        if (index !== -1) {
          state.payments[index] = updatedPayment;
        }
        
        // Update in enrollment payments
        if (state.enrollmentPayments[updatedPayment.enrollment_id]) {
          const enrollmentIndex = state.enrollmentPayments[updatedPayment.enrollment_id]
            .findIndex(p => p.id === updatedPayment.id);
          if (enrollmentIndex !== -1) {
            state.enrollmentPayments[updatedPayment.enrollment_id][enrollmentIndex] = updatedPayment;
          }
        }
        
        // Update in user payments
        if (updatedPayment.enrollment?.user_id && state.userPayments[updatedPayment.enrollment.user_id]) {
          const userIndex = state.userPayments[updatedPayment.enrollment.user_id]
            .findIndex(p => p.id === updatedPayment.id);
          if (userIndex !== -1) {
            state.userPayments[updatedPayment.enrollment.user_id][userIndex] = updatedPayment;
          }
        }
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update payment';
      });

    // Delete payment
    builder
      .addCase(deletePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        const deletedId = action.payload;
        
        // Remove from main payments array
        state.payments = state.payments.filter(p => p.id !== deletedId);
        
        // Remove from enrollment payments
        Object.keys(state.enrollmentPayments).forEach(enrollmentId => {
          state.enrollmentPayments[Number(enrollmentId)] = 
            state.enrollmentPayments[Number(enrollmentId)].filter(p => p.id !== deletedId);
        });
        
        // Remove from user payments
        Object.keys(state.userPayments).forEach(userId => {
          state.userPayments[Number(userId)] = 
            state.userPayments[Number(userId)].filter(p => p.id !== deletedId);
        });
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete payment';
      });

    // Confirm payment
    builder
      .addCase(confirmPayment.fulfilled, (state, action: PayloadAction<Payment>) => {
        const confirmedPayment = action.payload;
        
        // Update in main payments array
        const index = state.payments.findIndex(p => p.id === confirmedPayment.id);
        if (index !== -1) {
          state.payments[index] = confirmedPayment;
        }
        
        // Update in enrollment payments
        if (state.enrollmentPayments[confirmedPayment.enrollment_id]) {
          const enrollmentIndex = state.enrollmentPayments[confirmedPayment.enrollment_id]
            .findIndex(p => p.id === confirmedPayment.id);
          if (enrollmentIndex !== -1) {
            state.enrollmentPayments[confirmedPayment.enrollment_id][enrollmentIndex] = confirmedPayment;
          }
        }
        
        // Update in user payments
        if (confirmedPayment.enrollment?.user_id && state.userPayments[confirmedPayment.enrollment.user_id]) {
          const userIndex = state.userPayments[confirmedPayment.enrollment.user_id]
            .findIndex(p => p.id === confirmedPayment.id);
          if (userIndex !== -1) {
            state.userPayments[confirmedPayment.enrollment.user_id][userIndex] = confirmedPayment;
          }
        }
      });

    // Reject payment
    builder
      .addCase(rejectPayment.fulfilled, (state, action: PayloadAction<Payment>) => {
        const rejectedPayment = action.payload;
        
        // Update in main payments array
        const index = state.payments.findIndex(p => p.id === rejectedPayment.id);
        if (index !== -1) {
          state.payments[index] = rejectedPayment;
        }
        
        // Update in enrollment payments
        if (state.enrollmentPayments[rejectedPayment.enrollment_id]) {
          const enrollmentIndex = state.enrollmentPayments[rejectedPayment.enrollment_id]
            .findIndex(p => p.id === rejectedPayment.id);
          if (enrollmentIndex !== -1) {
            state.enrollmentPayments[rejectedPayment.enrollment_id][enrollmentIndex] = rejectedPayment;
          }
        }
        
        // Update in user payments
        if (rejectedPayment.enrollment?.user_id && state.userPayments[rejectedPayment.enrollment.user_id]) {
          const userIndex = state.userPayments[rejectedPayment.enrollment.user_id]
            .findIndex(p => p.id === rejectedPayment.id);
          if (userIndex !== -1) {
            state.userPayments[rejectedPayment.enrollment.user_id][userIndex] = rejectedPayment;
          }
        }
      });

    // Fetch payment stats
    builder
      .addCase(fetchPaymentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action: PayloadAction<PaymentStats>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payment stats';
      });
  },
});

export const { clearError, clearPayments, updatePaymentStatus } = paymentsSlice.actions;

// Selectors
export const selectAllPayments = (state: { payments: PaymentsState }) => state.payments.payments;
export const selectPaymentsLoading = (state: { payments: PaymentsState }) => state.payments.loading;
export const selectPaymentsError = (state: { payments: PaymentsState }) => state.payments.error;
export const selectPaymentStats = (state: { payments: PaymentsState }) => state.payments.stats;

export const selectEnrollmentPayments = (state: { payments: PaymentsState }, enrollmentId: number) => 
  state.payments.enrollmentPayments[enrollmentId] || [];

export const selectUserPayments = (state: { payments: PaymentsState }, userId: number) => 
  state.payments.userPayments[userId] || [];

export const selectPendingPayments = (state: { payments: PaymentsState }) => 
  state.payments.payments.filter(payment => payment.status === 'pending');

export const selectConfirmedPayments = (state: { payments: PaymentsState }) => 
  state.payments.payments.filter(payment => payment.status === 'confirmed');

export const selectRejectedPayments = (state: { payments: PaymentsState }) => 
  state.payments.payments.filter(payment => payment.status === 'rejected');

export default paymentsSlice.reducer;