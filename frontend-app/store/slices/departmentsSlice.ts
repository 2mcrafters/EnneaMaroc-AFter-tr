import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { departmentService } from '../../services/departmentServiceSimple';
import type { 
  Department, 
  DepartmentFunction, 
  DepartmentWithFunctions,
  CreateDepartmentData,
  CreateFunctionData
} from '../../types/departments';

interface DepartmentsState {
  departments: Department[];
  functions: DepartmentFunction[];
  userAccessibleDepartments: DepartmentWithFunctions[];
  selectedDepartment: DepartmentWithFunctions | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: DepartmentsState = {
  departments: [],
  functions: [],
  userAccessibleDepartments: [],
  selectedDepartment: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

// Actions async
export const fetchDepartmentsAsync = createAsyncThunk(
  'departments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const departments = await departmentService.getAllDepartments();
      return departments;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch departments');
    }
  }
);

export const fetchDepartmentByIdAsync = createAsyncThunk(
  'departments/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const department = await departmentService.getDepartmentById(id);
      return department;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch department');
    }
  }
);

export const fetchUserAccessibleDepartmentsAsync = createAsyncThunk(
  'departments/fetchUserAccessible',
  async (userRole: string, { rejectWithValue }) => {
    try {
      const departments = await departmentService.getDepartmentsByUserRole(userRole);
      return departments;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user accessible departments');
    }
  }
);

export const createDepartmentAsync = createAsyncThunk(
  'departments/create',
  async (data: CreateDepartmentData, { rejectWithValue }) => {
    try {
      const department = await departmentService.createDepartment(data);
      return department;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create department');
    }
  }
);

export const createFunctionAsync = createAsyncThunk(
  'departments/createFunction',
  async (data: CreateFunctionData, { rejectWithValue }) => {
    try {
      const func = await departmentService.createFunction(data);
      return func;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create function');
    }
  }
);

export const fetchUserAccessibleFunctionsAsync = createAsyncThunk(
  'departments/fetchUserAccessibleFunctions',
  async (userRole: string, { rejectWithValue }) => {
    try {
      const functions = await departmentService.getUserAccessibleFunctions(userRole);
      return functions;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user accessible functions');
    }
  }
);

const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedDepartment: (state, action: PayloadAction<DepartmentWithFunctions | null>) => {
      state.selectedDepartment = action.payload;
    },
    clearSelectedDepartment: (state) => {
      state.selectedDepartment = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all departments
    builder
      .addCase(fetchDepartmentsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartmentsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch department by ID
    builder
      .addCase(fetchDepartmentByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedDepartment = action.payload;
      })
      .addCase(fetchDepartmentByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch user accessible departments
    builder
      .addCase(fetchUserAccessibleDepartmentsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserAccessibleDepartmentsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userAccessibleDepartments = action.payload;
      })
      .addCase(fetchUserAccessibleDepartmentsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create department
    builder
      .addCase(createDepartmentAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createDepartmentAsync.fulfilled, (state, action) => {
        state.isSaving = false;
        state.departments.push(action.payload);
      })
      .addCase(createDepartmentAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Create function
    builder
      .addCase(createFunctionAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createFunctionAsync.fulfilled, (state, action) => {
        state.isSaving = false;
        state.functions.push(action.payload);
        
        // Update selected department if it matches
        if (state.selectedDepartment && state.selectedDepartment.id === action.payload.department_id) {
          state.selectedDepartment.functions.push(action.payload);
          state.selectedDepartment.functions.sort((a, b) => a.order - b.order);
        }
      })
      .addCase(createFunctionAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // Fetch user accessible functions
    builder
      .addCase(fetchUserAccessibleFunctionsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserAccessibleFunctionsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.functions = action.payload;
      })
      .addCase(fetchUserAccessibleFunctionsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedDepartment, clearSelectedDepartment } = departmentsSlice.actions;

// Selectors
export const selectDepartments = (state: { departments: DepartmentsState }) => state.departments.departments;
export const selectFunctions = (state: { departments: DepartmentsState }) => state.departments.functions;
export const selectUserAccessibleDepartments = (state: { departments: DepartmentsState }) => state.departments.userAccessibleDepartments;
export const selectSelectedDepartment = (state: { departments: DepartmentsState }) => state.departments.selectedDepartment;
export const selectDepartmentsLoading = (state: { departments: DepartmentsState }) => state.departments.isLoading;
export const selectDepartmentsSaving = (state: { departments: DepartmentsState }) => state.departments.isSaving;
export const selectDepartmentsError = (state: { departments: DepartmentsState }) => state.departments.error;

export default departmentsSlice.reducer;
