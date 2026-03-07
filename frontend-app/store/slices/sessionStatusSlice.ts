import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sessionStatusService } from '../../services/sessionStatusService';
import type { CourseGroupStatus } from '../../services/sessionStatusService';

interface SessionStatusState {
    courseGroupsStatus: Record<number, CourseGroupStatus[]>; // courseId -> group statuses
    isLoading: boolean;
    error: string | null;
}

const initialState: SessionStatusState = {
    courseGroupsStatus: {},
    isLoading: false,
    error: null,
};

// Async thunks
export const toggleCourseGroupStatusAsync = createAsyncThunk(
    'sessionStatus/toggleCourseGroupStatus',
    async ({ courseId, groupIndex, status }: { courseId: number; groupIndex: number; status: 'active' | 'inactive' }) => {
        console.log('🟢 toggleCourseGroupStatusAsync thunk called with:', { courseId, groupIndex, status });
        try {
            const response = await sessionStatusService.toggleCourseGroupStatus(courseId, groupIndex, status);
            console.log('🟢 toggleCourseGroupStatusAsync response:', response);
            return { courseId, groupIndex, status, response };
        } catch (error) {
            console.error('🟢 toggleCourseGroupStatusAsync error:', error);
            throw error;
        }
    }
);

export const fetchCourseGroupsStatusAsync = createAsyncThunk(
    'sessionStatus/fetchCourseGroupsStatus',
    async (courseId: number) => {
        const statuses = await sessionStatusService.getCourseGroupsStatus(courseId);
        return { courseId, statuses };
    }
);

const sessionStatusSlice = createSlice({
    name: 'sessionStatus',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        // Manually update course group status (optimistic update)
        updateCourseGroupStatus: (state, action) => {
            const { courseId, groupIndex, status } = action.payload;
            if (state.courseGroupsStatus[courseId]) {
                const group = state.courseGroupsStatus[courseId][groupIndex];
                if (group) {
                    group.status = status;
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Toggle course group status
            .addCase(toggleCourseGroupStatusAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(toggleCourseGroupStatusAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                const { courseId, groupIndex, status } = action.payload;
                // Update the status in our local state
                if (state.courseGroupsStatus[courseId]) {
                    const group = state.courseGroupsStatus[courseId][groupIndex];
                    if (group) {
                        group.status = status;
                    }
                }
            })
            .addCase(toggleCourseGroupStatusAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to toggle course group status';
            })
            
            // Fetch course groups status
            .addCase(fetchCourseGroupsStatusAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCourseGroupsStatusAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                const { courseId, statuses } = action.payload;
                state.courseGroupsStatus[courseId] = statuses;
            })
            .addCase(fetchCourseGroupsStatusAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch course groups status';
            });
    },
});

export const { 
    clearError, 
    updateCourseGroupStatus
} = sessionStatusSlice.actions;

// Selectors
export const selectSessionStatusState = (state: any) => state.sessionStatus as SessionStatusState;
export const selectCourseGroupsStatus = (state: any, courseId: number) => 
    selectSessionStatusState(state).courseGroupsStatus[courseId] || [];
export const selectSessionStatusLoading = (state: any) => selectSessionStatusState(state).isLoading;
export const selectSessionStatusError = (state: any) => selectSessionStatusState(state).error;

export default sessionStatusSlice.reducer;