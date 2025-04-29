import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { attendanceService } from "../../services/api";

// Get attendance for a batch on a specific date
export const fetchBatchAttendance = createAsyncThunk(
  "attendance/fetchBatchAttendance",
  async ({ batchId, date }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getBatchAttendance(batchId, date);
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load attendance records");
    }
  }
);

// Submit attendance for a batch
export const submitBatchAttendance = createAsyncThunk(
  "attendance/submitBatchAttendance",
  async ({ batchId, date, records }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.submitBatchAttendance(batchId, {
        date,
        records,
      });
      return { success: true, message: response.data.message || "Attendance submitted successfully" };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to submit attendance");
    }
  }
);

// Get attendance history for a batch
export const fetchBatchAttendanceHistory = createAsyncThunk(
  "attendance/fetchBatchAttendanceHistory",
  async ({ batchId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getBatchAttendanceHistory(batchId, startDate, endDate);
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load attendance history");
    }
  }
);

// Get attendance records for a specific student
export const fetchStudentAttendance = createAsyncThunk(
  "attendance/fetchStudentAttendance",
  async ({ studentId, batchId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getStudentAttendance(studentId, batchId, startDate, endDate);
      return response.data.data || {};
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load student attendance records");
    }
  }
);

const initialState = {
  batchAttendance: [],
  attendanceHistory: [],
  studentAttendance: null,
  loading: false,
  submitting: false,
  error: null,
  success: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearSuccess: (state) => {
      state.success = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateAttendanceRecord: (state, action) => {
      const { studentId, status } = action.payload;
      const index = state.batchAttendance.findIndex(record => record.studentId === studentId);
      if (index !== -1) {
        state.batchAttendance[index].status = status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Batch Attendance
      .addCase(fetchBatchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.batchAttendance = action.payload;
      })
      .addCase(fetchBatchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Submit Batch Attendance
      .addCase(submitBatchAttendance.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = null;
      })
      .addCase(submitBatchAttendance.fulfilled, (state, action) => {
        state.submitting = false;
        state.success = action.payload.message;
      })
      .addCase(submitBatchAttendance.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Fetch Batch Attendance History
      .addCase(fetchBatchAttendanceHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatchAttendanceHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceHistory = action.payload;
      })
      .addCase(fetchBatchAttendanceHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Student Attendance
      .addCase(fetchStudentAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.studentAttendance = action.payload;
      })
      .addCase(fetchStudentAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSuccess, clearError, updateAttendanceRecord } = attendanceSlice.actions;
export default attendanceSlice.reducer; 