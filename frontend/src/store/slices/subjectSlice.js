import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { subjectService } from "../../services/api";

// Async thunks
export const fetchSubjects = createAsyncThunk(
  "subjects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await subjectService.getAll();
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch subjects" });
    }
  }
);

export const createSubject = createAsyncThunk(
  "subjects/create",
  async (subjectData, { rejectWithValue }) => {
    try {
      const response = await subjectService.create(subjectData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to create subject" });
    }
  }
);

export const updateSubject = createAsyncThunk(
  "subjects/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await subjectService.update(id, data);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to update subject" });
    }
  }
);

export const deleteSubject = createAsyncThunk(
  "subjects/delete",
  async (id, { rejectWithValue }) => {
    try {
      await subjectService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to delete subject" });
    }
  }
);

const initialState = {
  subjects: [],
  loading: false,
  error: null,
  success: false,
};

const subjectSlice = createSlice({
  name: "subjects",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Subjects
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch subjects";
      })
      // Create Subject
      .addCase(createSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects.push(action.payload);
        state.success = true;
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create subject";
      })
      // Update Subject
      .addCase(updateSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subjects.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) {
          state.subjects[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update subject";
      })
      // Delete Subject
      .addCase(deleteSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = state.subjects.filter(
          (s) => s._id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete subject";
      });
  },
});

export const { resetStatus } = subjectSlice.actions;
export default subjectSlice.reducer;
