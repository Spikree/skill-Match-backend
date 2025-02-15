import Job from "../../models/posting.js";
import express from "express";
import verifyToken from "../../utils/verifyToken.js";
import checkEmployerRole from "../../utils/checkEmployerRole.js";
import mongoose from "mongoose";

const deleteJob = express.Router();

deleteJob.delete("/deleteJob/:jobId", verifyToken, checkEmployerRole, async (req,res) => {
    const {user} = req.user;
    const {jobId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ error: "Invalid job ID format" });
    }

    if(!jobId) {
        return res.status(400).json({
            message: "Please provide a job id"
        })
    }

    try {
        const job = await Job.findById(jobId)

        if(!job) {
            return res.status(404).json({
                message: "Job not found"
            })
        }

        if(!job.employer.equals(user._id)) {
            return res.status(403).json({
                message:"You are not authorised to delete this job"
            })
        }

        await job.deleteOne();

        return res.status(200).json({
            message: "Job deleted successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

export default deleteJob;