import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import studentReducer from "./slices/studentSlice";
import classReducer from "./slices/classSlice";
import paymentReducer from "./slices/paymentSlice";
import announcementReducer from "./slices/announcementSlice";
import staffReducer from "./slices/staffSlice";
import teacherReducer from "./slices/teacherSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    classes: classReducer,
    payments: paymentReducer,
    announcements: announcementReducer,
    staff: staffReducer,
    teachers: teacherReducer,
  },
});
