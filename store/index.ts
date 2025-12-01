import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';
import authReducer from './authSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    admin: adminReducer,
  },
   // This is necessary to allow non-serializable data like File objects in the state.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['app/startPdfAnalysis/pending'],
        ignoredPaths: ['app.currentFile'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;