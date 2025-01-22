import express from "express";
import Job from "../../models/posting.js";
import verifyToken from "../../utils/verifyToken.js";
import User from "../../models/user.js";
import currentJob from "../../models/currentJob.js";

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
  
      if (!job) {
        return res.status(404).json({
          message: "Job not found"
        });
      }
  
      const employer = await User.findById(job.employer);
      
      if (!employer) {
        return res.status(404).json({
          message: "Employer not found"
        });
      }
  
      const jobObject = job.toObject();
      
      jobObject.employerName = employer.profile?.name || 'Unknown';
  
      return res.status(200).json({
        message: "Fetched job successfully",
        job: jobObject
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error"
      });
    }
  });

  getJobs.get("/getCurrentJob", verifyToken, async (req,res) => {
    const {user} = req.user;

    if(!user) {
      return res.status(400).json({
        message: "Login please"
      })
    }

    try {
      const currJob = await currentJob.find({
        freelancer: user._id,
      })

      if(!currJob) {
        return res.status(200).json({
          message: "You don't have any current job yet",
        })
      }

      return res.status(200).json({
        message: "fetched correct job sucessfully",
        currJob
      })
    } catch (error) {
      return res.status(400).json({
        message: "Internal server error"
      })
    }
  })

export default getJobs;
