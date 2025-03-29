import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { announcementService } from "../../services/api";

export const fetchAnnouncements = createAsyncThunk(
  "announcements/fetchAnnouncements",
  async () => {
    const response = await announcementService.getAll();
    return response.data;
  }
);

export const createAnnouncement = createAsyncThunk(
  "announcements/createAnnouncement",
  async (announcementData) => {
    const response = await announcementService.create(announcementData);
    return response.data;
  }
);

export const updateAnnouncement = createAsyncThunk(
  "announcements/updateAnnouncement",
  async ({ id, data }) => {
    const response = await announcementService.update(id, data);
    return response.data;
  }
);

export const deleteAnnouncement = createAsyncThunk(
  "announcements/deleteAnnouncement",
  async (id) => {
    await announcementService.delete(id);
    return id;
  }
);

const initialState = {
  announcements: [],
  loading: false,
  error: null,
};

const announcementSlice = createSlice({
  name: "announcements",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Announcements
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Announcement
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.announcements.push(action.payload);
      })
      // Update Announcement
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        const index = state.announcements.findIndex(
          (announcement) => announcement._id === action.payload._id
        );
        if (index !== -1) {
          state.announcements[index] = action.payload;
        }
      })
      // Delete Announcement
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.announcements = state.announcements.filter(
          (announcement) => announcement._id !== action.payload
        );
      });
  },
});

export default announcementSlice.reducer;
