import Job from "../../models/posting.js"
import express from "express"
import verifyToken from "../../utils/verifyToken.js"
import checkEmployerRole from "../../utils/checkEmployerRole.js"

const createJob = express.Router();

createJob.post("/createJob",verifyToken, checkEmployerRole, async(req,res) => {
    const { user } = req.user;
    const {title,description,budget,skillsRequired,status} = req.body;

    if (!title || !description || !budget || !skillsRequired) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const job = await Job.create({
            title:title,
            description:description,
            budget: budget,
            skillsRequired:skillsRequired,
            status:status,
            employer: user._id
        });

        job.save();

        return res.status(200).json({
            message: "Job listing created sucessfully",
            job
        });
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: "Internal server error"
        })
    }
});

export {createJob}