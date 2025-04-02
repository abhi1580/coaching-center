import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { standardService } from "../../services/api";

// Async thunks
export const fetchStandards = createAsyncThunk(
  "standards/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await standardService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch standards" }
      );
    }
  }
);

export const createStandard = createAsyncThunk(
  "standards/create",
  async (standardData, { rejectWithValue }) => {
    try {
      console.log("Creating standard with data:", standardData); // Debug log
      const response = await standardService.create(standardData);
      console.log("Standard creation response:", response); // Debug log
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error creating standard:", error); // Debug log
      return rejectWithValue(
        error.response?.data || { message: "Failed to create standard" }
      );
    }
  }
);

export const updateStandard = createAsyncThunk(
  "standards/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await standardService.update(id, data);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update standard" }
      );
    }
  }
);

export const deleteStandard = createAsyncThunk(
  "standards/delete",
  async (id, { rejectWithValue }) => {
    try {
      await standardService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete standard" }
      );
    }
  }
);

const initialState = {
  standards: [],
  loading: false,
  error: null,
  success: false,
};

const standardSlice = createSlice({
  name: "standards",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Standards
      .addCase(fetchStandards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStandards.fulfilled, (state, action) => {
        state.loading = false;
        state.standards = action.payload.data || [];
      })
      .addCase(fetchStandards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch standards";
      })
      // Create Standard
      .addCase(createStandard.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createStandard.fulfilled, (state, action) => {
        state.loading = false;
        state.standards.push(action.payload.data);
        state.success = true;
      })
      .addCase(createStandard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create standard";
      })
      // Update Standard
      .addCase(updateStandard.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateStandard.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.standards.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) {
          state.standards[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateStandard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update standard";
      })
      // Delete Standard
      .addCase(deleteStandard.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteStandard.fulfilled, (state, action) => {
        state.loading = false;
        state.standards = state.standards.filter(
          (s) => s._id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteStandard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete standard";
      });
  },
});

export const { resetStatus } = standardSlice.actions;
export default standardSlice.reducer;
