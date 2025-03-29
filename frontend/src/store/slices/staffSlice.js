import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { staffService } from "../../services/api";

export const fetchStaff = createAsyncThunk("staff/fetchStaff", async () => {
  const response = await staffService.getAll();
  return response.data;
});

export const createStaffMember = createAsyncThunk(
  "staff/createStaffMember",
  async (staffData) => {
    const response = await staffService.create(staffData);
    return response.data;
  }
);

export const updateStaffMember = createAsyncThunk(
  "staff/updateStaffMember",
  async ({ id, data }) => {
    const response = await staffService.update(id, data);
    return response.data;
  }
);

export const deleteStaffMember = createAsyncThunk(
  "staff/deleteStaffMember",
  async (id) => {
    await staffService.delete(id);
    return id;
  }
);

const initialState = {
  staff: [],
  loading: false,
  error: null,
};

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Staff
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staff = action.payload;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Staff Member
      .addCase(createStaffMember.fulfilled, (state, action) => {
        state.staff.push(action.payload);
      })
      // Update Staff Member
      .addCase(updateStaffMember.fulfilled, (state, action) => {
        const index = state.staff.findIndex(
          (member) => member._id === action.payload._id
        );
        if (index !== -1) {
          state.staff[index] = action.payload;
        }
      })
      // Delete Staff Member
      .addCase(deleteStaffMember.fulfilled, (state, action) => {
        state.staff = state.staff.filter(
          (member) => member._id !== action.payload
        );
      });
  },
});

export default staffSlice.reducer;
