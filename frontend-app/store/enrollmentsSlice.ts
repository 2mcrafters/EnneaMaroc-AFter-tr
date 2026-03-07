import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { enrollmentService, Enrollment, CreateEnrollmentData, UpdateEnrollmentData } from '../services/enrollmentService';
import { enrichEnrollmentsWithGroupData } from '../utils/enrollmentUtils';

// Async thunk pour récupérer les inscriptions avec group_data enrichi
export const fetchEnrichedEnrollments = createAsyncThunk(
  'enrollments/fetchEnriched',
  async (_, { getState }) => {
    const enrollments = await enrollmentService.getAllEnrollments();
    
    // Récupérer les cours du state global
    const state = getState() as any;
    const courses = state.courses?.courses || [];
    
    // Enrichir avec group_data
    return enrichEnrollmentsWithGroupData(enrollments, courses);
  }
);

export const fetchEnrichedUserEnrollments = createAsyncThunk(
  'enrollments/fetchEnrichedByUser',
  async (userId: number, { getState }) => {
    const enrollments = await enrollmentService.getUserEnrollments(userId);
    
    // Récupérer les cours du state global
    const state = getState() as any;
    const courses = state.courses?.courses || [];
    
    // Enrichir avec group_data
    return enrichEnrollmentsWithGroupData(enrollments, courses);
  }
);

// Async thunks pour les actions asynchrones
export const fetchAllEnrollments = createAsyncThunk(
  'enrollments/fetchAll',
  async () => {
    return await enrollmentService.getAllEnrollments();
  }
);

export const fetchUserEnrollments = createAsyncThunk(
  'enrollments/fetchByUser',
  async (userId: number) => {
    return await enrollmentService.getUserEnrollments(userId);
  }
);

export const fetchCourseEnrollments = createAsyncThunk(
  'enrollments/fetchByCourse',
  async (courseId: number) => {
    return await enrollmentService.getCourseEnrollments(courseId);
  }
);

export const createEnrollment = createAsyncThunk(
  'enrollments/create',
  async (data: CreateEnrollmentData) => {
    return await enrollmentService.createEnrollment(data);
  }
);

export const createBulkEnrollments = createAsyncThunk(
  'enrollments/createBulk',
  async (enrollmentsData: CreateEnrollmentData[]) => {
    return await enrollmentService.createBulkEnrollments(enrollmentsData);
  }
);

export const updateEnrollment = createAsyncThunk(
  'enrollments/update',
  async ({ id, data }: { id: number; data: UpdateEnrollmentData }) => {
    return await enrollmentService.updateEnrollment(id, data);
  }
);

export const deleteEnrollment = createAsyncThunk(
  'enrollments/delete',
  async (id: number) => {
    await enrollmentService.deleteEnrollment(id);
    return id;
  }
);

export const enrollInCourse = createAsyncThunk(
  'enrollments/enrollInCourse',
  async ({ userId, courseId, groupData }: { userId: number; courseId: number; groupData?: any }) => {
    return await enrollmentService.enrollInCourse(userId, courseId, groupData);
  }
);

export const unenroll = createAsyncThunk(
  'enrollments/unenroll',
  async (enrollmentId: number) => {
    await enrollmentService.unenroll(enrollmentId);
    return enrollmentId;
  }
);

export const activateEnrollment = createAsyncThunk(
  'enrollments/activate',
  async (enrollmentId: number) => {
    return await enrollmentService.activateEnrollment(enrollmentId);
  }
);

export const cancelEnrollment = createAsyncThunk(
  'enrollments/cancel',
  async (enrollmentId: number) => {
    return await enrollmentService.cancelEnrollment(enrollmentId);
  }
);

interface EnrollmentsState {
  enrollments: Enrollment[];
  userEnrollments: Record<number, Enrollment[]>; // enrollments by user id
  courseEnrollments: Record<number, Enrollment[]>; // enrollments by course id
  loading: boolean;
  error: string | null;
}

const initialState: EnrollmentsState = {
  enrollments: [],
  userEnrollments: {},
  courseEnrollments: {},
  loading: false,
  error: null,
};

const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearEnrollments: (state) => {
      state.enrollments = [];
      state.userEnrollments = {};
      state.courseEnrollments = {};
    },
  },
  extraReducers: (builder) => {
    // Fetch all enrollments
    builder
      .addCase(fetchAllEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllEnrollments.fulfilled, (state, action: PayloadAction<Enrollment[]>) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(fetchAllEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch enrollments';
      });

    // Fetch user enrollments
    builder
      .addCase(fetchUserEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.meta.arg;
        console.log(`[enrollmentsSlice] fetchUserEnrollments fulfilled for user ${userId}:`, action.payload);
        state.userEnrollments[userId] = action.payload;
      })
      .addCase(fetchUserEnrollments.rejected, (state, action) => {
        state.loading = false;
        console.error('[enrollmentsSlice] fetchUserEnrollments rejected:', action.error);
        state.error = action.error.message || 'Failed to fetch user enrollments';
      });

    // Fetch course enrollments
    builder
      .addCase(fetchCourseEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        const courseId = action.meta.arg;
        state.courseEnrollments[courseId] = action.payload;
      })
      .addCase(fetchCourseEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch course enrollments';
      });

    // Create enrollment
    builder
      .addCase(createEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEnrollment.fulfilled, (state, action: PayloadAction<Enrollment>) => {
        state.loading = false;
        const payload = action.payload as Enrollment | undefined | null;
        if (!payload || typeof payload !== 'object' || payload.id == null || payload.user_id == null) {
          state.error = 'Invalid enrollment payload received from server.';
          return; // éviter crash
        }
        state.enrollments.push(payload);

        const userId = payload.user_id;
        if (state.userEnrollments[userId]) {
          state.userEnrollments[userId].push(payload);
        }
        if (payload.course_id && state.courseEnrollments[payload.course_id]) {
          state.courseEnrollments[payload.course_id].push(payload);
        }
      })
      .addCase(createEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create enrollment';
      });

    // Create bulk enrollments
    builder
      .addCase(createBulkEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBulkEnrollments.fulfilled, (state, action: PayloadAction<Enrollment[]>) => {
        state.loading = false;
        const enrollments = action.payload;
        
        if (!Array.isArray(enrollments)) {
          state.error = 'Invalid bulk enrollments payload received from server.';
          return;
        }

        // Add each enrollment to the state
        enrollments.forEach(enrollment => {
          if (enrollment && typeof enrollment === 'object' && enrollment.id != null && enrollment.user_id != null) {
            state.enrollments.push(enrollment);

            const userId = enrollment.user_id;
            if (state.userEnrollments[userId]) {
              state.userEnrollments[userId].push(enrollment);
            }
            if (enrollment.course_id && state.courseEnrollments[enrollment.course_id]) {
              state.courseEnrollments[enrollment.course_id].push(enrollment);
            }
          }
        });
      })
      .addCase(createBulkEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create bulk enrollments';
      });

    // Update enrollment
    builder
      .addCase(updateEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEnrollment.fulfilled, (state, action: PayloadAction<Enrollment>) => {
        state.loading = false;
        const updatedEnrollment = action.payload;
        
        // Update in main enrollments array
        const index = state.enrollments.findIndex(e => e.id === updatedEnrollment.id);
        if (index !== -1) {
          state.enrollments[index] = updatedEnrollment;
        }
        
        // Update in user enrollments
        const userId = updatedEnrollment.user_id;
        if (state.userEnrollments[userId]) {
          const userIndex = state.userEnrollments[userId].findIndex(e => e.id === updatedEnrollment.id);
          if (userIndex !== -1) {
            state.userEnrollments[userId][userIndex] = updatedEnrollment;
          }
        }
        
        // Update in course enrollments
        if (updatedEnrollment.course_id && state.courseEnrollments[updatedEnrollment.course_id]) {
          const courseIndex = state.courseEnrollments[updatedEnrollment.course_id].findIndex(e => e.id === updatedEnrollment.id);
          if (courseIndex !== -1) {
            state.courseEnrollments[updatedEnrollment.course_id][courseIndex] = updatedEnrollment;
          }
        }
        

      })
      .addCase(updateEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update enrollment';
      });

    // Delete enrollment
    builder
      .addCase(deleteEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEnrollment.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        const deletedId = action.payload;
        
        // Remove from main enrollments array
        state.enrollments = state.enrollments.filter(e => e.id !== deletedId);
        
        // Remove from user enrollments
        Object.keys(state.userEnrollments).forEach(userId => {
          state.userEnrollments[Number(userId)] = state.userEnrollments[Number(userId)].filter(e => e.id !== deletedId);
        });
        
        // Remove from course enrollments
        Object.keys(state.courseEnrollments).forEach(courseId => {
          state.courseEnrollments[Number(courseId)] = state.courseEnrollments[Number(courseId)].filter(e => e.id !== deletedId);
        });
        

      })
      .addCase(deleteEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete enrollment';
      });

    // Enroll in course
    builder
      .addCase(enrollInCourse.fulfilled, (state, action: PayloadAction<Enrollment>) => {
        // Same as create enrollment
        state.enrollments.push(action.payload);
        
        const userId = action.payload.user_id;
        if (state.userEnrollments[userId]) {
          state.userEnrollments[userId].push(action.payload);
        }
        
        if (action.payload.course_id && state.courseEnrollments[action.payload.course_id]) {
          state.courseEnrollments[action.payload.course_id].push(action.payload);
        }
      });



    // Unenroll (update status to cancelled)
    builder
      .addCase(unenroll.fulfilled, (state, action: PayloadAction<number>) => {
        const enrollmentId = action.payload;
        
        // Find and update the enrollment status to 'cancelled'
        const enrollment = state.enrollments.find(e => e.id === enrollmentId);
        if (enrollment) {
          enrollment.status = 'cancelled';
        }
        
        // Update in user enrollments
        Object.values(state.userEnrollments).forEach(userEnrollments => {
          const userEnrollment = userEnrollments.find(e => e.id === enrollmentId);
          if (userEnrollment) {
            userEnrollment.status = 'cancelled';
          }
        });
        
        // Update in course enrollments
        Object.values(state.courseEnrollments).forEach(courseEnrollments => {
          const courseEnrollment = courseEnrollments.find(e => e.id === enrollmentId);
          if (courseEnrollment) {
            courseEnrollment.status = 'cancelled';
          }
        });
        

      });

    // Activate enrollment (admin action)
    builder
      .addCase(activateEnrollment.fulfilled, (state, action: PayloadAction<Enrollment>) => {
        const activatedEnrollment = action.payload;
        
        // Update in main enrollments array
        const index = state.enrollments.findIndex(e => e.id === activatedEnrollment.id);
        if (index !== -1) {
          state.enrollments[index] = activatedEnrollment;
        }
        
        // Update in user enrollments
        const userId = activatedEnrollment.user_id;
        if (state.userEnrollments[userId]) {
          const userIndex = state.userEnrollments[userId].findIndex(e => e.id === activatedEnrollment.id);
          if (userIndex !== -1) {
            state.userEnrollments[userId][userIndex] = activatedEnrollment;
          }
        }
        
        // Update in course enrollments
        if (activatedEnrollment.course_id && state.courseEnrollments[activatedEnrollment.course_id]) {
          const courseIndex = state.courseEnrollments[activatedEnrollment.course_id].findIndex(e => e.id === activatedEnrollment.id);
          if (courseIndex !== -1) {
            state.courseEnrollments[activatedEnrollment.course_id][courseIndex] = activatedEnrollment;
          }
        }
        

      });

    // Cancel enrollment (admin action)
    builder
      .addCase(cancelEnrollment.fulfilled, (state, action: PayloadAction<Enrollment>) => {
        const cancelledEnrollment = action.payload;
        
        // Update in main enrollments array
        const index = state.enrollments.findIndex(e => e.id === cancelledEnrollment.id);
        if (index !== -1) {
          state.enrollments[index] = cancelledEnrollment;
        }
        
        // Update in user enrollments
        const userId = cancelledEnrollment.user_id;
        if (state.userEnrollments[userId]) {
          const userIndex = state.userEnrollments[userId].findIndex(e => e.id === cancelledEnrollment.id);
          if (userIndex !== -1) {
            state.userEnrollments[userId][userIndex] = cancelledEnrollment;
          }
        }
        
        // Update in course enrollments
        if (cancelledEnrollment.course_id && state.courseEnrollments[cancelledEnrollment.course_id]) {
          const courseIndex = state.courseEnrollments[cancelledEnrollment.course_id].findIndex(e => e.id === cancelledEnrollment.id);
          if (courseIndex !== -1) {
            state.courseEnrollments[cancelledEnrollment.course_id][courseIndex] = cancelledEnrollment;
          }
        }
        

      });
  },
});

export const { clearError, clearEnrollments } = enrollmentsSlice.actions;

// Selectors
export const selectAllEnrollments = (state: { enrollments: EnrollmentsState }) => state.enrollments.enrollments;
export const selectEnrollmentsLoading = (state: { enrollments: EnrollmentsState }) => state.enrollments.loading;
export const selectEnrollmentsError = (state: { enrollments: EnrollmentsState }) => state.enrollments.error;

export const selectUserEnrollments = (state: { enrollments: EnrollmentsState }, userId: number) => {
  const userEnrollments = state.enrollments.userEnrollments[userId] || [];
  return userEnrollments;
};

export const selectCourseEnrollments = (state: { enrollments: EnrollmentsState }, courseId: number) => 
  state.enrollments.courseEnrollments[courseId] || [];

export const selectActiveEnrollments = (state: { enrollments: EnrollmentsState }) => 
  state.enrollments.enrollments.filter(enrollment => enrollment.status === 'active');

export const selectUserActiveEnrollments = (state: { enrollments: EnrollmentsState }, userId: number) => 
  (state.enrollments.userEnrollments[userId] || []).filter(enrollment => enrollment.status === 'active');

export const selectCourseActiveEnrollments = (state: { enrollments: EnrollmentsState }, courseId: number) => 
  (state.enrollments.courseEnrollments[courseId] || []).filter(enrollment => enrollment.status === 'active');

export default enrollmentsSlice.reducer;