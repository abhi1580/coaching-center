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
      if (error.response?.status === 404) {
        // No attendance records found is not actually an error
        return [];
      }
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

// Get attendance history for a student in a batch
export const fetchStudentAttendance = createAsyncThunk(
  "attendance/fetchStudentAttendance",
  async ({ studentId, batchId }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getStudentAttendance(studentId, batchId);
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load student attendance history");
    }
  }
);

// Get attendance statistics for a student
export const fetchStudentAttendanceStats = createAsyncThunk(
  "attendance/fetchStudentAttendanceStats",
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getStudentAttendanceStats(studentId);
      return response.data.data || {};
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load student attendance statistics");
    }
  }
);

// Get attendance statistics for a batch
export const fetchBatchAttendanceStats = createAsyncThunk(
  "attendance/fetchBatchAttendanceStats",
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getBatchAttendanceStats(batchId);
      return response.data.data || {};
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load batch attendance statistics");
    }
  }
);

const initialState = {
  batchAttendance: [],
  studentAttendance: [],
  studentStats: {},
  batchStats: {},
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
        state.error = action.payload || action.error.message;
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
        state.error = action.payload || action.error.message;
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
        state.error = action.payload || action.error.message;
      })
      
      // Fetch Student Attendance Stats
      .addCase(fetchStudentAttendanceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAttendanceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.studentStats = action.payload;
      })
      .addCase(fetchStudentAttendanceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      
      // Fetch Batch Attendance Stats
      .addCase(fetchBatchAttendanceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatchAttendanceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.batchStats = action.payload;
      })
      .addCase(fetchBatchAttendanceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSuccess, clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer; 