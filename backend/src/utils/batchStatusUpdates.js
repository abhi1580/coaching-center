import Batch from "../models/Batch.js";

export const updateBatchStatuses = async () => {
  try {
    console.log("Running batch status update check");
    await Batch.updateBatchStatuses();
    console.log("Batch status update completed successfully");
  } catch (error) {
    console.error("Error updating batch statuses:", error);
  }
}; 