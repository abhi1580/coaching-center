import Announcement from "../models/Announcement.js";

export const checkAndExpireAnnouncements = async () => {
  try {
    const now = new Date();

    // Find announcements that have passed their end date
    const expiredAnnouncements = await Announcement.updateMany(
      {
        endDate: { $lt: now },
        status: { $ne: "expired" },
      },
      { $set: { status: "expired" } }
    );
  } catch (error) {
    // Error handled silently
  }
};
