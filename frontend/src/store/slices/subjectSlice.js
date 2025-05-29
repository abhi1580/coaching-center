import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/common/apiClient";

// Async thunks
export const fetchSubjects = createAsyncThunk(
  "subjects/fetchSubjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/subjects");
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch subjects");
    }
  }
);

export const fetchStandards = createAsyncThunk(
  "subjects/fetchStandards",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/standards");
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch standards");
    }
  }
);

export const createSubject = createAsyncThunk(
  "subjects/createSubject",
  async (subjectData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/subjects", subjectData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create subject");
    }
  }
);

export const updateSubject = createAsyncThunk(
  "subjects/updateSubject",
  async ({ id, subjectData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/subjects/${id}`, subjectData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update subject");
    }
  }
);

export const deleteSubject = createAsyncThunk(
  "subjects/deleteSubject",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/subjects/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete subject");
    }
  }
);

const initialState = {
  subjects: [],
  standards: [],
  loading: false,
  error: null,
};

const subjectSlice = createSlice({
  name: "subjects",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
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
        state.subjects = action.payload || [];
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.subjects = [];
      })
      // Fetch Standards
      .addCase(fetchStandards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStandards.fulfilled, (state, action) => {
        state.loading = false;
        state.standards = action.payload || [];
      })
      .addCase(fetchStandards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.standards = [];
      })
      // Create Subject
      .addCase(createSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.subjects.push(action.payload);
        }
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Subject
      .addCase(updateSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.subjects.findIndex(
            (subject) => subject._id === action.payload._id
          );
          if (index !== -1) {
            state.subjects[index] = action.payload;
          }
        }
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Subject
      .addCase(deleteSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = state.subjects.filter(
          (subject) => subject._id !== action.payload
        );
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = subjectSlice.actions;
export default subjectSlice.reducer;
