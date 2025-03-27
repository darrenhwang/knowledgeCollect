import { configureStore } from '@reduxjs/toolkit';
import fileReducer from './slices/fileSlice';
import knowledgeReducer from './slices/knowledgeSlice';
import questionReducer from './slices/questionSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    files: fileReducer,
    knowledge: knowledgeReducer,
    questions: questionReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 