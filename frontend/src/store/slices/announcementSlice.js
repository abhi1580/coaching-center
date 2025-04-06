import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

// Async thunks
export const fetchAnnouncements = createAsyncThunk(
  "announcements/fetchAnnouncements",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching announcements...");
      const response = await api.get("/announcements");
      console.log("Raw response:", response);

      // If the API returned no data or empty data, provide a fallback structure
      if (
        !response.data ||
        (response.data && Object.keys(response.data).length === 0)
      ) {
        console.log("No data returned from API, using fallback");
        return {
          data: [],
          counts: {
            total: 0,
            active: 0,
            scheduled: 0,
            expired: 0,
          },
        };
      }

      return response.data;
    } catch (error) {
      console.error("Error in fetchAnnouncements:", error);

      // Provide a more detailed error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch announcements";

      return rejectWithValue({
        message: errorMessage,
        status: error.response?.status || 500,
      });
    }
  }
);

export const fetchAnnouncement = createAsyncThunk(
  "announcements/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/announcements/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  "announcements/createAnnouncement",
  async (announcementData, { rejectWithValue }) => {
    try {
      const response = await api.post("/announcements", announcementData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const updateAnnouncement = createAsyncThunk(
  "announcements/updateAnnouncement",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/announcements/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  "announcements/deleteAnnouncement",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/announcements/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

const initialState = {
  data: [],
  counts: {
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
  },
  currentAnnouncement: null,
  loading: false,
  error: null,
  success: false,
};

const announcementSlice = createSlice({
  name: "announcements",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all announcements
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;

        // Handle different response formats
        if (action.payload && action.payload.data) {
          // API returns { data: [...], counts: {...} }
          state.data = action.payload.data;
          state.counts = action.payload.counts || {
            total: action.payload.data.length,
            active: 0,
            scheduled: 0,
            expired: 0,
          };
        } else if (Array.isArray(action.payload)) {
          // API returns array directly
          state.data = action.payload;
          state.counts = {
            total: action.payload.length,
            active: 0,
            scheduled: 0,
            expired: 0,
          };
        } else {
          // Fallback
          state.data = [];
          state.counts = {
            total: 0,
            active: 0,
            scheduled: 0,
            expired: 0,
          };
        }

        // Log for debugging
        console.log("Received announcements data:", action.payload);
        console.log("Processed data:", state.data);
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single announcement
      .addCase(fetchAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAnnouncement = action.payload;
      })
      .addCase(fetchAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create announcement
      .addCase(createAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data.unshift(action.payload.data);
        state.counts.total += 1;
        if (action.payload.data.status === "Active") {
          state.counts.active += 1;
        } else if (action.payload.data.status === "Scheduled") {
          state.counts.scheduled += 1;
        } else if (action.payload.data.status === "Expired") {
          state.counts.expired += 1;
        }
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update announcement
      .addCase(updateAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.data.findIndex(
          (a) => a._id === action.payload.data._id
        );
        if (index !== -1) {
          const oldStatus = state.data[index].status;
          const newStatus = action.payload.data.status;

          // Update counts based on status change
          if (oldStatus !== newStatus) {
            if (oldStatus === "Active") state.counts.active -= 1;
            else if (oldStatus === "Scheduled") state.counts.scheduled -= 1;
            else if (oldStatus === "Expired") state.counts.expired -= 1;

            if (newStatus === "Active") state.counts.active += 1;
            else if (newStatus === "Scheduled") state.counts.scheduled += 1;
            else if (newStatus === "Expired") state.counts.expired += 1;
          }

          state.data[index] = action.payload.data;
        }
      })
      .addCase(updateAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete announcement
      .addCase(deleteAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.data.findIndex((a) => a._id === action.payload);
        if (index !== -1) {
          const announcement = state.data[index];
          state.counts.total -= 1;
          if (announcement.status === "Active") state.counts.active -= 1;
          else if (announcement.status === "Scheduled")
            state.counts.scheduled -= 1;
          else if (announcement.status === "Expired") state.counts.expired -= 1;
          state.data.splice(index, 1);
        }
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetStatus } = announcementSlice.actions;
export default announcementSlice.reducer;

const validAnnouncementTypes = ["General", "Event", "Holiday", "Exam", "Emergency", "Other"];

export const isValidAnnouncementType = (type) => {
  return validAnnouncementTypes.includes(type);
};
