import express from "express";
import Job from "../../models/posting.js";
import verifyToken from "../../utils/verifyToken.js";
import User from "../../models/user.js";
import currentJob from "../../models/currentJob.js";
import checkEmployerRole from "../../utils/checkEmployerRole.js";

const getOnGoingJob = express.Router();

getOnGoingJob.get("/getOnGoingJobs", verifyToken,checkEmployerRole, async (req,res) => {
    const { user } = req.user;

    try {
        const jobs = await currentJob.find({
            employer: user._id,
        });

        if(!jobs) {
            return res.status(200).json({
                message: "You currently have no on going job",
            })
        }

        return res.status(200).json({
            message: "Fetched current jobs",
            jobs
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

export default getOnGoingJob;