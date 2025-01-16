import express from "express"
import Job from "../../models/posting.js";
import verifyToken from "../../utils/verifyToken.js";

const getJobs = express.Router();

getJobs.get("/getJobs/", verifyToken, async(req,res) => {
    try {
        const jobs = await Job.find({status: "open"});

        const completedJobs = await Job.find({status: "completed"});

        const cancelledJobs = await Job.find({status: "cancelled"});

        return res.status(200).json({
            message: "Fetched all jobs sucessfully",
            jobs,
            completedJobs,
            cancelledJobs
        })
    } catch (error) {
        return res.status(400).json({
            message: "Internal server error",
        })
    }
})

export default getJobs;