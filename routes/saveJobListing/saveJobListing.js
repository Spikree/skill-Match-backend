import express from "express";
import verifyToken from "../../utils/verifyToken.js";
import savedJobs from "../../models/savedJobs.js";

const saveJob = express.Router();

saveJob.post("/saveJob/:jobId", verifyToken, async (req, res) => {
  const jobId = req.params.jobId;
  const { jobTitle, jobDescription } = req.body;
  const { user } = req.user;

  if (!user) {
    return res.status(400).json({
      message: "Unauthorized, please login",
    });
  }

  if (!jobDescription || !jobTitle || !jobId) {
    return res.status(400).json({
      message: "jobDescription , jobTitle and jobId are required",
    });
  }

  try {
    const existingJob = await savedJobs.findOne({ jobId, freelancer: user });

    if (existingJob) {
      await savedJobs.deleteOne({ jobId: jobId });
      return res.status(200).json({ message: "Job removed from saved jobs." });
    }

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
    const savedBlogs = await savedJobs.find({
      freelancer: user,
    });

    return res.status(200).json({
      message: "Fetched saved Jobs",
      savedBlogs,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Internal server error",
    });
  }
});

export default saveJob;
