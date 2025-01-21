import express from "express";
import verifyToken from "../../utils/verifyToken.js";
import savedJobs from "../../models/savedJobs.js";
import Job from "../../models/posting.js"

const saveJob = express.Router();

saveJob.post("/saveJob/:jobId", verifyToken, async (req, res) => {
  const jobId = req.params.jobId;
  const { user } = req.user;

  if (!user) {
    return res.status(400).json({
      message: "Unauthorized, please login",
    });
  }

  if (!jobId) {
    return res.status(400).json({
      message: "jobId are required",
    });
  }

  try {
    const existingJob = await savedJobs.findOne({ jobId, freelancer: user._id });

    if (existingJob) {
      await savedJobs.deleteOne({ jobId: jobId });
      return res.status(200).json({ message: "Job removed from saved jobs." });
    }

    const getJob = await Job.findById(jobId)

    if(!getJob) {
      return res.status(404).json({
        message: "Job not found"
      })
    }

    const jobTitle = getJob.title;
    const jobDescription = getJob.description;

    const savedJob = await savedJobs.create({
      jobId: jobId,
      jobTitle: jobTitle,
      jobDescription: jobDescription,
      freelancer: user,
    });

    savedJob.save();

    return res.status(200).json({
      message: "Job saved",
      savedJob,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Internal server error",
    });
  }
});

saveJob.get("/getSavedJobs", verifyToken, async (req, res) => {
  const { user } = req.user;

  if (!user) {
    return res.status(400).json({
      message: "Unauthorized, please login",
    });
  }

  try {
    const allSavedJobs = await savedJobs.find({
      freelancer: user,
    });

    return res.status(200).json({
      message: "Fetched saved Jobs",
      allSavedJobs,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Internal server error",
    });
  }
});

export default saveJob;
