import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { standardService } from "../../services/api";

// Async thunks
export const fetchStandards = createAsyncThunk(
  "standards/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await standardService.getAll("/standards?populate=subjects");
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

// Add new thunk to check for duplicates
export const checkDuplicateStandard = createAsyncThunk(
  "standards/checkDuplicate",
  async ({ name, level }, { getState, rejectWithValue }) => {
    try {
      const { standards } = getState().standards;
      
      // Check if a standard with the same name already exists
      const nameExists = standards.some(
        (standard) => standard.name.toLowerCase() === name.toLowerCase()
      );
      
      // Check if a standard with the same level already exists
      const levelExists = standards.some(
        (standard) => standard.level === Number(level)
      );
      
      if (nameExists || levelExists) {
        return {
          isDuplicate: true,
          duplicateType: {
            name: nameExists,
            level: levelExists
          }
        };
      }
      
      return { isDuplicate: false };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to check for duplicates" }
      );
    }
  }
);

const initialState = {
  standards: [],
  loading: false,
  error: null,
  success: false,
  duplicateCheck: null
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
        
        // Handle different response formats
        const standardData = action.payload?.data || action.payload;
        
        // Make sure we have a valid standard object before pushing
        if (standardData && typeof standardData === 'object') {
          state.standards.push(standardData);
        } else {
          console.error("Invalid standard data format:", standardData);
        }
        
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
      })
      // Check Duplicate Standard
      .addCase(checkDuplicateStandard.pending, (state) => {
        state.duplicateCheck = null;
      })
      .addCase(checkDuplicateStandard.fulfilled, (state, action) => {
        state.duplicateCheck = action.payload;
      })
      .addCase(checkDuplicateStandard.rejected, (state, action) => {
        state.duplicateCheck = { error: action.payload?.message || "Failed to check for duplicates" };
      });
  },
});

export const { resetStatus } = standardSlice.actions;
export default standardSlice.reducer;
