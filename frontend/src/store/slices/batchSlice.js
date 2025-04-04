import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { batchService } from "../../services/api";

// Async thunks
export const fetchBatches = createAsyncThunk(
  "batches/fetchBatches",
  async (_, { rejectWithValue }) => {
    try {
      const response = await batchService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch batches");
    }
  }
);

export const fetchBatchesBySubject = createAsyncThunk(
  "batches/fetchBatchesBySubject",
  async ({ subjects, standard }, { rejectWithValue }) => {
    try {
      const response = await batchService.getBySubject(subjects, standard);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch batches by subject"
      );
    }
  }
);

export const createBatch = createAsyncThunk(
  "batches/createBatch",
  async (batchData, { rejectWithValue }) => {
    try {
      const response = await batchService.create(batchData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create batch");
    }
  }
);

export const updateBatch = createAsyncThunk(
  "batches/updateBatch",
  async ({ id, batchData }, { rejectWithValue }) => {
    try {
      const response = await batchService.update(id, batchData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update batch");
    }
  }
);

export const deleteBatch = createAsyncThunk(
  "batches/deleteBatch",
  async (id, { rejectWithValue }) => {
    try {
      await batchService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete batch");
    }
  }
);

const initialState = {
  batches: [],
  loading: false,
  error: null,
  success: false,
};

const batchSlice = createSlice({
  name: "batches",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch batches
      .addCase(fetchBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = action.payload;
      })
      .addCase(fetchBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch batches by subject
      .addCase(fetchBatchesBySubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatchesBySubject.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = action.payload;
      })
      .addCase(fetchBatchesBySubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create batch
      .addCase(createBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches.push(action.payload);
        state.success = true;
      })
      .addCase(createBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update batch
      .addCase(updateBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBatch.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.batches.findIndex(
          (batch) => batch._id === action.payload._id
        );
        if (index !== -1) {
          state.batches[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete batch
      .addCase(deleteBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = state.batches.filter(
          (batch) => batch._id !== action.payload
        );
        state.success = true;
      })
      .addCase(deleteBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetStatus } = batchSlice.actions;
export default batchSlice.reducer;
