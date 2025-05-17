// progressController.js
import Progress  from "../models/progressModel.js";

export const saveOrUpdateProgress = async (req, res) => {
  try {
    const { enrollment_id, lessons_completed, progress_percentage, current_status } = req.body;

    // Check if a progress record already exists for the given enrollment_id
    let progress = await Progress.findOne({ enrollment_id });

    if (progress) {
      // If it exists, update the progress
      progress.lessons_completed = lessons_completed;
      progress.progress_percentage = progress_percentage;
      progress.current_status = current_status;

      await progress.save();
      return res.status(200).json({ message: 'Progress updated successfully' });
    } else {
      // If it doesn't exist, create a new record
      progress = new Progress({
        enrollment_id,
        lessons_completed,
        progress_percentage,
        current_status,
      });

      await progress.save();
      return res.status(201).json({ message: 'Progress saved successfully' });
    }
  } catch (error) {
    console.error("Error saving/updating progress:", error);
    res.status(500).json({ message: "Error saving/updating progress" });
  }
};
