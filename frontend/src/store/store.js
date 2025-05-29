import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import batchReducer from "./slices/batchSlice";
import standardReducer from "./slices/standardSlice";
import subjectReducer from "./slices/subjectSlice";
import teacherReducer from "./slices/teacherSlice";
import studentReducer from "./slices/studentSlice";
import authReducer from "./slices/authSlice";

// Create the store with all reducers
export const store = configureStore({
  reducer: {
    batches: batchReducer,
    standards: standardReducer,
    subjects: subjectReducer,
    teachers: teacherReducer,
    students: studentReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

// Enable the refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);
