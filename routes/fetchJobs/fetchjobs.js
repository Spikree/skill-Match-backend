import express from "express"
import Job from "../../models/posting.js";
import verifyToken from "../../utils/verifyToken.js";

const getJobs = express.Router();

getJobs.get("/getJobs/", verifyToken, async(req,res) => {
    try {
        const jobs = await Job.find({status: "open"});

        const closedJobs = await Job.find({status: "closed"})

        const completedJobs = await Job.find({status: "completed"});

        const cancelledJobs = await Job.find({status: "cancelled"});

        const jobsInProgress = await Job.find({status: "in progress"})

        return res.status(200).json({
            message: "Fetched all jobs sucessfully",
            jobs,
            completedJobs,
            cancelledJobs,
            closedJobs,
            jobsInProgress
        })
    } catch (error) {
        return res.status(400).json({
            message: "Internal server error",
        })
    }
})

getJobs.get("/getJob/:jobId",verifyToken, async(req,res) => {
    const jobId = req.params.jobId;

    if(!jobId) {
        return res.status(400).json({
            message: "job id is required",
        })
    }

    try {
        const job = await Job.findById(jobId);

        return res.status(200).json({
            message: "Fetched job sucessfully",
            job
        })
    } catch (error) {
        return res.status(400).json({
            message: "Internal server error"
        })
    }
})

export default getJobs;