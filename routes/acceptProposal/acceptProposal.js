import express from "express";
import verifyToken from "../../utils/verifyToken.js";
import checkEmployerRole from "../../utils/checkEmployerRole.js";
import Job from "../../models/posting.js";
import Proposal from "../../models/proposal.js";

const acceptProposal = express.Router();

acceptProposal.post(
  "/acceptProposal/:jobId/:proposalId",
  verifyToken,
  checkEmployerRole,
  async (req, res) => {
    const { jobId, proposalId } = req.params;
    const { user } = req.user;

    if (!user) {
      return res.status(400).json({
        message: "Unauthorized, please login",
      });
    }

    try {
      const job = await Job.findOne({ _id: jobId, employer: user });
      if (!job) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      const proposal = await Proposal.findOne({ _id: proposalId, job: jobId });

      if (!proposal) {
        return res.status(404).json({
          message: "proposal not found",
        });
      }

      if (job.status !== "open") {
        return res.status(400).json({
          message: "You cannot accept a proposal for a job that is not open",
        });
      }

      proposal.status = "accepted";

      await proposal.save();

      await Proposal.updateMany(
        { job: jobId, _id: { $ne: proposalId } },
        { status: "rejected" }
      );

      job.status = "in progress"
      await job.save()

      return res.status(200).json({
        message: "Proposal accepted sucessfully",
        proposal,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  }
);

export default acceptProposal
