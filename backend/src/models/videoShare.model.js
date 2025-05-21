import mongoose from "mongoose";

const videoShareSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    youtubeLink: {
      type: String,
      required: [true, "YouTube link is required"],
      trim: true,
    },
    videoId: {
      type: String,
      required: [true, "Video ID is required"],
      unique: true,
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
    },
    channelName: {
      type: String,
      required: [true, "Channel name is required"],
    },
    channelId: {
      type: String,
      required: [true, "Channel ID is required"],
    },
    uploadDate: {
      type: Date,
      required: [true, "Upload date is required"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
      },
    ],
    subject: {
      type: String,
      required: [true, "Subject is required"],
      enum: ["physics", "chemistry", "mathematics"],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
videoShareSchema.index({ subject: 1, createdAt: -1 });
videoShareSchema.index({ videoId: 1 }, { unique: true });
videoShareSchema.index({ uploadedBy: 1 });

const VideoShare = mongoose.model("VideoShare", videoShareSchema);

export default VideoShare;
