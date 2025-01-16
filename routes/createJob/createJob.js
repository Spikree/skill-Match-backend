import Job from "../../models/posting.js";
import express from "express";
import verifyToken from "../../utils/verifyToken.js";
import checkEmployerRole from "../../utils/checkEmployerRole.js";

const createJob = express.Router();

createJob.post(
  "/createJob",
  verifyToken,
  checkEmployerRole,
  async (req, res) => {
    const { user } = req.user;
    const { title, description, budget, skillsRequired, status } = req.body;

    if (!title || !description || !budget || !skillsRequired) {
      return res.status(400).json({ message: "All fields are required." });
    }

    try {
      const job = await Job.create({
        title: title,
        description: description,
        budget: budget,
        skillsRequired: skillsRequired,
        status: status,
        employer: user._id,
      });

      job.save();

      return res.status(200).json({
        message: "Job listing created sucessfully",
        job,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "Internal server error",
      });
    }
  }
);

createJob.put(
  "/editStatus/:jobId",
  verifyToken,
  checkEmployerRole,
  async (req, res) => {
    const { user } = req.user;
    const { jobId } = req.params;
    const { status } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required." });
    }

    const validStatuses = ["open", "in progress", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status. Status must be one of the following: open, in progress, completed, or cancelled.",
      });
    }

    try {
      const getJob = await Job.findById(jobId);

      if (getJob.employer.toString() !== user._id) {
        return res.status(400).json({
          message: "You are not authorised to edit this job",
        });
      }

      const job = await Job.findByIdAndUpdate(
        jobId,
        { status: status },
        { new: true }
      );

      return res.status(200).json({
        message: "Job status updated successfully",
        job,
      });
    } catch (error) {}
  }
);

export { createJob };
