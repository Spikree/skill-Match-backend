import express from "express";
import Job from "../../models/posting.js";
import Proposal from "../../models/proposal.js";
import verifyToken from "../../utils/verifyToken.js";

const submitProposal = express.Router();

submitProposal.post("/submit/:id", verifyToken, async (req, res) => {
  const { id } = req.params; // job id
  const { user } = req.user;
  const { bidAmount, coverLetter } = req.body;

  if (!bidAmount) {
    return res.status(400).json({ message: "Please enter a bid amount" });
  }

  console.log(user._id)
  if (!coverLetter) {
    return res.status(400).json({ message: "Please enter a cover letter" });
  }

  try {
    const isJob = await Job.findById(id);

    if (!isJob) {
      return res.status(400).json({
        message: "Job not found",
      });
    }

    const isProposal = await Proposal.findOne({
      job: id,
      freelancer: user,
    });

    if (isProposal) {
      return res.status(400).json({
        message: "You have already submitted a proposal for this job",
      });
    }

    const proposal = new Proposal({
      job: id,
      freelancer: user._id,
      bidAmount: bidAmount,
      coverLetter: coverLetter,
    });

    await proposal.save();

    res.status(200).json({
      message: "Proposal submitted successfully",
      proposal,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal server error" });
  }
});

submitProposal.get("/getAppliedJobs", verifyToken, async (req,res) => {
    const { user } = req.user;

    try {
        const appliedJobs = await Proposal.find({freelancer: user._id})

        // if(!appliedJobs || appliedJobs.length === 0){
        //     return res.status(200).json({
        //         message: "No Jobs found"
        //     })
        // }

        return res.status(200).json({
            message: "Fetched Applied Jobs",
            appliedJobs,
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

export default submitProposal;
