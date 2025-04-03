import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import subjectReducer from "./slices/subjectSlice";
import standardReducer from "./slices/standardSlice";
import studentReducer from "./slices/studentSlice";
import batchReducer from "./slices/batchSlice";
import teacherReducer from "./slices/teacherSlice";
import announcementReducer from "./slices/announcementSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectReducer,
    standards: standardReducer,
    students: studentReducer,
    batches: batchReducer,
    teachers: teacherReducer,
    announcements: announcementReducer,
  },
});
