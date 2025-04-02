import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { subjectService } from "../../services/api";

// Async thunks
export const fetchSubjects = createAsyncThunk(
  "subjects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await subjectService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subjects"
      );
    }
  }
);

export const createSubject = createAsyncThunk(
  "subjects/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await subjectService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create subject"
      );
    }
  }
);

export const updateSubject = createAsyncThunk(
  "subjects/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await subjectService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update subject"
      );
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
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete subject"
      );
    }
  }
);

const subjectSlice = createSlice({
  name: "subjects",
  initialState: {
    subjects: [],
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    resetStatus: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch subjects
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload.data || [];
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create subject
      .addCase(createSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects.push(action.payload.data);
        state.success = "Subject created successfully";
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update subject
      .addCase(updateSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subjects.findIndex(
          (subject) => subject._id === action.payload.data._id
        );
        if (index !== -1) {
          state.subjects[index] = action.payload.data;
        }
        state.success = "Subject updated successfully";
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete subject
      .addCase(deleteSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = state.subjects.filter(
          (subject) => subject._id !== action.payload
        );
        state.success = "Subject deleted successfully";
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetStatus } = subjectSlice.actions;
export default subjectSlice.reducer;
