import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/simpleAuthSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import enrollmentsReducer from './enrollmentsSlice';
import paymentsReducer from './slices/paymentsSlice';
import sessionStatusReducer from './slices/sessionStatusSlice';
import sessionCancellationsReducer from './slices/sessionCancellationsSlice';
import departmentsReducer from './slices/departmentsSlice';
import parcoursReducer from './slices/parcoursSlice';
import agendaReducer from './slices/agendaSlice';
import { errorMiddleware } from './middleware/errorMiddleware';


// Configuration du store Redux
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    ui: uiReducer,
    enrollments: enrollmentsReducer,
    payments: paymentsReducer,
    sessionStatus: sessionStatusReducer,
    sessionCancellations: sessionCancellationsReducer,
    departments: departmentsReducer,
    parcours: parcoursReducer,
    agenda: agendaReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(errorMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks typés pour l'utilisation dans les composants
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;