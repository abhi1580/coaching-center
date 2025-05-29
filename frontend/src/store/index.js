import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import subjectReducer from "./slices/subjectSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store; 