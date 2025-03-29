import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { teacherService } from "../../services/api";

export const fetchTeachers = createAsyncThunk(
  "teachers/fetchTeachers",
  async () => {
    const response = await teacherService.getAll();
    // Handle different possible response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response.data.teachers)) {
      return response.data.teachers;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  }
);

export const createTeacher = createAsyncThunk(
  "teachers/createTeacher",
  async (teacherData) => {
    const response = await teacherService.create(teacherData);
    return response.data;
  }
);

export const updateTeacher = createAsyncThunk(
  "teachers/updateTeacher",
  async ({ id, data }) => {
    const response = await teacherService.update(id, data);
    return response.data;
  }
);

export const deleteTeacher = createAsyncThunk(
  "teachers/deleteTeacher",
  async (id) => {
    await teacherService.delete(id);
    return id;
  }
);

const initialState = {
  teachers: [],
  loading: false,
  error: null,
};

const teacherSlice = createSlice({
  name: "teachers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Teachers
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Teacher
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.teachers.push(action.payload);
      })
      // Update Teacher
      .addCase(updateTeacher.fulfilled, (state, action) => {
        const index = state.teachers.findIndex(
          (teacher) => teacher._id === action.payload._id
        );
        if (index !== -1) {
          state.teachers[index] = action.payload;
        }
      })
      // Delete Teacher
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.teachers = state.teachers.filter(
          (teacher) => teacher._id !== action.payload
        );
      });
  },
});

export default teacherSlice.reducer;
