import express from "express";
import Job from "../../models/posting.js";
import verifyToken from "../../utils/verifyToken.js";
import User from "../../models/user.js";

const getJobs = express.Router();

getJobs.get("/getJobs", verifyToken, async (req, res) => {
    try {
      const jobs = await Job.find({ status: "open" });
  
      const employerIds = jobs.map((job) => job.employer);
  
      const employers = await User.find({ _id: { $in: employerIds } });
  
      const employerMap = {};
      employers.forEach((employer) => {
        employerMap[employer._id.toString()] = employer.profile?.name || 'Unknown';
      });
  
      const jobsWithEmployerNames = jobs.map(job => ({
        ...job.toObject(),
        employerName: employerMap[job.employer.toString()] || 'Unknown'
      }));
  
      return res.status(200).json({
        message: "Fetched all jobs successfully",
        jobs: jobsWithEmployerNames
      });
    } catch (error) {
      console.error("Error in getJobs:", error);  
      return res.status(500).json({  
        message: "Internal server error"
      });
    }
  });

getJobs.get("/getJob/:jobId", verifyToken, async (req, res) => {
  const jobId = req.params.jobId;

  if (!jobId) {
    return res.status(400).json({
      message: "job id is required",
    });
  }

  try {
    const job = await Job.findById(jobId);

    return res.status(200).json({
      message: "Fetched job sucessfully",
      job,
    });
  } catch (error) {
    return res.status(400).json({
      message: "Internal server error",
    });
  }
});

export default getJobs;
