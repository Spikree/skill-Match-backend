import express from "express"
import Job from "../../models/posting.js"
import verifyToken from "../../utils/verifyToken.js";
import FinishedJob from "../../models/finishedJob.js";
const finished = express.Router();

finished.post("/markFinished/:jobId",verifyToken, async(req,res) => {
    const {jobId} = req.params;
    const { user } = req.user; 

    const id = user._id

    try {
        const job = await Job.findById(jobId)

        if(!job) {
            return res.status(404).json({
                message: "Job not found"
            })
        }

        if(job.status !== "completed") {
            return res.status(400).json({
                message: "Job must be completed by the employer before it can be marked as finished"
            })
        }

        const finishedJob = new FinishedJob({
            jobTitle: job.title,
            jobDescription: job.description,
            jobId: job._id,
            freelancer: id,
        })

        await finishedJob.save();

        return res.status(201).json({
            message: "Job Marked as finished",
            finishedJob
        })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

finished.get("/getFinishedJobs", verifyToken, async(req,res) => {
    const { user } = req.user;

    try {
        const finishedJobs = await FinishedJob.find({freelancer: user._id})
        return res.status(200).json({
            message: "fetched Jobs",
            finishedJobs
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

export default finished