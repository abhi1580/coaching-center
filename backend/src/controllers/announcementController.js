import Announcement from "../models/Announcement.js";
import { validateMongoDbId } from "../utils/validateMongoDbId.js";
import { handleError } from "../utils/errorHandler.js";

// Get all announcements
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    handleError(res, error);
  }
};

// Get single announcement
export const getAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);

    const announcement = await Announcement.findById(id).populate(
      "createdBy",
      "name"
    );
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.json(announcement);
  } catch (error) {
    handleError(res, error);
  }
};

// Create announcement
export const createAnnouncement = async (req, res) => {
  try {
    const announcement = new Announcement({
      ...req.body,
      createdBy: req.user._id,
    });
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    handleError(res, error);
  }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if user is the creator of the announcement
    if (announcement.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this announcement" });
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    res.json(updatedAnnouncement);
  } catch (error) {
    handleError(res, error);
  }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    // Check if user is the creator of the announcement
    if (announcement.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this announcement" });
    }

    await Announcement.findByIdAndDelete(id);
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    handleError(res, error);
  }
};
