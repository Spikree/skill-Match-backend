import express from "express"
import verifyToken from "../../utils/verifyToken.js";
import checkEmployerRole from "../../utils/checkEmployerRole.js";
import Job from "../../models/posting.js"

const fetchCreatedJobs = express.Router();

fetchCreatedJobs.get("/getCreatedJobs", verifyToken, checkEmployerRole, async (req,res) => {
    const {user} = req.user;

    try {
        const jobs = await Job.find({
            status: "open", 
            employer: user._id
        })

        if(jobs.length === 0 ) {
            return res.status(200).json({
                message: "You didnt create any job yet"
            })
        }

        return res.status(201).json({
            message: "Fetched all jobs sucessfully",
            jobs
        })
    } catch (error) {
        return res.status(400).json({
            message: "Internal server error"
        })
    }
})

export default fetchCreatedJobs