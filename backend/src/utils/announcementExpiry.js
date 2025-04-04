import Announcement from "../models/Announcement.js";

export const checkAndExpireAnnouncements = async () => {
  try {
    const now = new Date();
    const expiredAnnouncements = await Announcement.find({
      endTime: { $lt: now },
      status: "Active",
    });

    if (expiredAnnouncements.length > 0) {
      await Announcement.updateMany(
        { _id: { $in: expiredAnnouncements.map((a) => a._id) } },
        { $set: { status: "Expired" } }
      );
      console.log(`Expired ${expiredAnnouncements.length} announcements`);
    }
  } catch (error) {
    console.error("Error in checking announcement expiry:", error);
  }
};
