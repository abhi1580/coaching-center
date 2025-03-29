import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { studentService } from "../../services/api";

// Async thunks
export const fetchStudents = createAsyncThunk(
  "students/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentService.getAll();
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch students" }
      );
    }
  }
);

export const createStudent = createAsyncThunk(
  "students/create",
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await studentService.create(studentData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create student" }
      );
    }
  }
);

export const updateStudent = createAsyncThunk(
  "students/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await studentService.update(id, data);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update student" }
      );
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "students/delete",
  async (id, { rejectWithValue }) => {
    try {
      await studentService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete student" }
      );
    }
  }
);

const initialState = {
  students: [],
  loading: false,
  error: null,
  success: false,
};

const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Students
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch students";
      })
      // Create Student
      .addCase(createStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.students.push(action.payload);
        state.success = true;
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create student";
      })
      // Update Student
      .addCase(updateStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.students.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) {
          state.students[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update student";
      })
      // Delete Student
      .addCase(deleteStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.students = state.students.filter((s) => s._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete student";
      });
  },
});

export const { resetStatus } = studentSlice.actions;
export default studentSlice.reducer;
