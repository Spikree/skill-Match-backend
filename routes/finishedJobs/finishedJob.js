import express from "express";
import Job from "../../models/posting.js";
import verifyToken from "../../utils/verifyToken.js";
import FinishedJob from "../../models/finishedJob.js";
import currentJob from "../../models/currentJob.js";
import proposal from "../../models/proposal.js";
const finished = express.Router();

finished.post("/markFinished/:jobId", verifyToken, async (req, res) => {
  const { jobId } = req.params;


  try {
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const currJob = await currentJob.findOne({jobId:jobId});

    if(!currJob) {
      return res.status(400).json({
        message: "This job was not accepted by anybody"
      })
    }

    const deleteFromAppliedJobs = await proposal.findOneAndDelete({
      job: jobId
    })

    if (job.status !== "completed") {
      return res.status(400).json({
        message:
          "Job must be completed by the employer before it can be marked as finished",
      });
    }

    const finJob = await FinishedJob.find({
      jobId: job._id,
      freelancer: currJob.freelancer,
    })

    if(finJob) {
      return res.status(400).json({
        message: "This job was already marked as finished"
      })
    }

    const finishedJob = new FinishedJob({
      jobTitle: job.title,
      jobDescription: job.description,
      jobId: job._id,
      freelancer: currJob.freelancer,
    });

    await finishedJob.save();

    await currentJob.deleteOne({ _id: currJob._id });

    return res.status(201).json({
      message: "Job Marked as finished",
      finishedJob,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal server error" });
  }
});

finished.get("/getFinishedJobs", verifyToken, async (req, res) => {
  const { user } = req.user;

  try {
    const finishedJobs = await FinishedJob.find({ freelancer: user._id });
    return res.status(200).json({
      message: "fetched Jobs",
      finishedJobs,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default finished;
