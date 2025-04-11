import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { batchService } from "../../services/api";

// Helper function to merge batch data
const mergeBatchData = (oldBatches = [], newBatches = []) => {
  if (!newBatches.length) return oldBatches;
  if (!oldBatches.length) return newBatches;

  return newBatches.map((newBatch) => {
    // Find existing batch with same ID
    const existingBatch = oldBatches.find((b) => b._id === newBatch._id);

    if (!existingBatch) return newBatch;

    // If both have enrolledStudents, we need to merge them
    if (
      existingBatch.enrolledStudents &&
      Array.isArray(existingBatch.enrolledStudents) &&
      existingBatch.enrolledStudents.length > 0
    ) {
      // If new batch doesn't have enrolledStudents, use the existing ones
      if (
        !newBatch.enrolledStudents ||
        !Array.isArray(newBatch.enrolledStudents)
      ) {
        return {
          ...newBatch,
          enrolledStudents: existingBatch.enrolledStudents,
        };
      }

      // If new batch has fewer enrolledStudents, it might be missing some
      if (
        newBatch.enrolledStudents.length < existingBatch.enrolledStudents.length
      ) {
        // Get existing student IDs
        const existingStudentIds = new Set(
          existingBatch.enrolledStudents.map((s) =>
            s._id ? s._id.toString() : s.toString()
          )
        );

        // Get new student IDs
        const newStudentIds = new Set(
          newBatch.enrolledStudents.map((s) =>
            s._id ? s._id.toString() : s.toString()
          )
        );

        // Find students in existing batch not in new batch
        const missingStudents = existingBatch.enrolledStudents.filter((s) => {
          const studentId = s._id ? s._id.toString() : s.toString();
          return !newStudentIds.has(studentId);
        });

        // If there are missing students, add them to the new batch
        if (missingStudents.length > 0) {
          console.log(
            `Adding ${missingStudents.length} missing students to batch ${newBatch._id}`
          );
          return {
            ...newBatch,
            enrolledStudents: [
              ...newBatch.enrolledStudents,
              ...missingStudents,
            ],
          };
        }
      }
    }

    return newBatch;
  });
};

// Async thunks
export const fetchBatches = createAsyncThunk(
  "batches/fetchAll",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      // Always populate enrolled students for better user experience
      const { populateEnrolledStudents = true, forceRefresh = false } = params;
      const response = await batchService.getAll(populateEnrolledStudents);

      // Handle the response data - it might be in response.data.data or just response.data
      let batchData = response.data.data || response.data;

      // If not forcing a refresh, merge with existing data to retain enrolled students
      if (!forceRefresh) {
        const currentState = getState();
        const existingBatches = currentState.batches?.batches || [];
        batchData = mergeBatchData(existingBatches, batchData);
      }

      return batchData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch batches" }
      );
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
  "batches/create",
  async (batchData, { rejectWithValue }) => {
    try {
      const response = await batchService.create(batchData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create batch" }
      );
    }
  }
);

export const updateBatch = createAsyncThunk(
  "batches/update",
  async ({ id, data }, { rejectWithValue, getState }) => {
    try {
      const response = await batchService.update(id, data);
      const updatedBatch = response.data.data || response.data;

      // Preserve enrolled students if the update doesn't include them
      const currentState = getState();
      const existingBatch = currentState.batches.batches.find(
        (b) => b._id === id
      );

      if (
        existingBatch?.enrolledStudents?.length > 0 &&
        (!updatedBatch.enrolledStudents ||
          updatedBatch.enrolledStudents.length === 0)
      ) {
        updatedBatch.enrolledStudents = existingBatch.enrolledStudents;
      }

      return updatedBatch;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update batch" }
      );
    }
  }
);

export const deleteBatch = createAsyncThunk(
  "batches/delete",
  async (id, { rejectWithValue }) => {
    try {
      await batchService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete batch" }
      );
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
    updateBatchEnrollment: (state, action) => {
      const { batchId, student } = action.payload;

      const batchIndex = state.batches.findIndex(
        (batch) => batch._id === batchId
      );

      if (batchIndex !== -1) {
        const batch = state.batches[batchIndex];

        if (!batch.enrolledStudents) {
          batch.enrolledStudents = [student];
        } else {
          if (!batch.enrolledStudents.some((s) => s._id === student._id)) {
            batch.enrolledStudents.push(student);
          }
        }

        state.batches[batchIndex] = batch;
      }
    },
    // Add a new action to update a specific batch by ID
    updateBatchById: (state, action) => {
      const { batchId, batchData } = action.payload;
      const batchIndex = state.batches.findIndex(
        (batch) => batch._id === batchId
      );

      if (batchIndex !== -1) {
        // Replace the batch with new data
        state.batches[batchIndex] = {
          ...state.batches[batchIndex],
          ...batchData,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBatches
      .addCase(fetchBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = action.payload;
        state.error = null;
      })
      .addCase(fetchBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch batches";
      })
      // fetchBatchesBySubject
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
      // createBatch
      .addCase(createBatch.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches.push(action.payload);
        state.success = true;
      })
      .addCase(createBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create batch";
      })
      // updateBatch
      .addCase(updateBatch.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateBatch.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.batches.findIndex(
          (batch) => batch._id === action.payload._id
        );
        if (index !== -1) {
          // Preserve student data if needed
          if (
            !action.payload.enrolledStudents &&
            state.batches[index].enrolledStudents
          ) {
            action.payload.enrolledStudents =
              state.batches[index].enrolledStudents;
          }
          state.batches[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update batch";
      })
      // deleteBatch
      .addCase(deleteBatch.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
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
        state.error = action.payload?.message || "Failed to delete batch";
      });
  },
});

export const { resetStatus, updateBatchEnrollment, updateBatchById } =
  batchSlice.actions;
export default batchSlice.reducer;
