import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../services/api";

// Async thunks
export const fetchAnnouncements = createAsyncThunk(
  "announcements/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/announcements");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
  "announcements/create",
  async (announcementData) => {
    try {
      // Format date as YYYY-MM-DD string for backend
      const formatDateForBackend = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return dateString; // Return original ISO date string (YYYY-MM-DD)
      };

      const formattedData = {
        ...announcementData,
        startDate: formatDateForBackend(announcementData.startDate),
        endDate: formatDateForBackend(announcementData.endDate),
        startTime: "00:00",
        endTime: "23:59",
        createdBy: announcementData.createdBy || "65f1a1a1a1a1a1a1a1a1a1a1", // Default admin user ID
      };

      if (!formattedData.startDate || !formattedData.endDate) {
        throw new Error("Start date and end date are required");
      }

      const response = await api.post("/announcements", formattedData);
      return response.data;
    } catch (error) {
      console.error("Error in createAnnouncement thunk:", error);
      throw error;
    }
  }
);

export const updateAnnouncement = createAsyncThunk(
  "announcements/update",
  async ({ id, data }) => {
    try {
      // Format date as YYYY-MM-DD string for backend
      const formatDateForBackend = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return dateString; // Return original ISO date string (YYYY-MM-DD)
      };

      const formattedData = {
        ...data,
        startDate: formatDateForBackend(data.startDate),
        endDate: formatDateForBackend(data.endDate),
        startTime: "00:00",
        endTime: "23:59",
      };

      if (!formattedData.startDate || !formattedData.endDate) {
        throw new Error("Start date and end date are required");
      }

      const response = await api.put(`/announcements/${id}`, formattedData);
      return response.data;
    } catch (error) {
      console.error("Error in updateAnnouncement thunk:", error);
      throw error;
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  "announcements/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/announcements/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
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
        // Ensure we're working with an array
        const announcements = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload.data)
          ? action.payload.data
          : [];

        state.data = announcements;

        // Calculate counts based on status
        state.counts = {
          total: announcements.length,
          active: announcements.filter((a) => a.status === "active").length,
          scheduled: announcements.filter((a) => a.status === "scheduled")
            .length,
          expired: announcements.filter((a) => a.status === "expired").length,
        };
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
        const newAnnouncement = action.payload.data || action.payload;
        state.data = [newAnnouncement, ...state.data];
        state.counts.total += 1;

        // Update status count
        if (newAnnouncement.status === "active") state.counts.active += 1;
        else if (newAnnouncement.status === "scheduled")
          state.counts.scheduled += 1;
        else if (newAnnouncement.status === "expired")
          state.counts.expired += 1;
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
        const updatedAnnouncement = action.payload.data || action.payload;
        const index = state.data.findIndex(
          (a) => a._id === updatedAnnouncement._id
        );

        if (index !== -1) {
          const oldStatus = state.data[index].status;
          const newStatus = updatedAnnouncement.status;

          // Update counts based on status change
          if (oldStatus !== newStatus) {
            if (oldStatus === "active") state.counts.active -= 1;
            else if (oldStatus === "scheduled") state.counts.scheduled -= 1;
            else if (oldStatus === "expired") state.counts.expired -= 1;

            if (newStatus === "active") state.counts.active += 1;
            else if (newStatus === "scheduled") state.counts.scheduled += 1;
            else if (newStatus === "expired") state.counts.expired += 1;
          }

          state.data[index] = updatedAnnouncement;
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

          // Update status count
          if (announcement.status === "active") state.counts.active -= 1;
          else if (announcement.status === "scheduled")
            state.counts.scheduled -= 1;
          else if (announcement.status === "expired") state.counts.expired -= 1;

          state.data.splice(index, 1);
        }
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = announcementSlice.actions;
export default announcementSlice.reducer;

// Helper functions
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

export const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "success";
    case "scheduled":
      return "warning";
    case "expired":
      return "error";
    default:
      return "default";
  }
};

const validAnnouncementTypes = [
  "General",
  "Event",
  "Holiday",
  "Exam",
  "Emergency",
  "Other",
];

export const isValidAnnouncementType = (type) => {
  return validAnnouncementTypes.includes(type);
};
