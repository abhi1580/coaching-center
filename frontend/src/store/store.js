import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import subjectReducer from "./slices/subjectSlice";
import standardReducer from "./slices/standardSlice";
import studentReducer from "./slices/studentSlice";
import batchReducer from "./slices/batchSlice";
import teacherReducer from "./slices/teacherSlice";
import announcementReducer from "./slices/announcementSlice";
import attendanceReducer from "./slices/attendanceSlice";

// Create store configuration
const storeConfig = {
  reducer: {
    auth: authReducer,
    subjects: subjectReducer,
    standards: standardReducer,
    students: studentReducer,
    batches: batchReducer,
    teachers: teacherReducer,
    announcements: announcementReducer,
    attendance: attendanceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
};

// Create and export store
export const store = configureStore(storeConfig);
