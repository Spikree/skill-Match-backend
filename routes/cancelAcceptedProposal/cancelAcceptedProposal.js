import express from "express"
import verifyToken from "../../utils/verifyToken.js";
import checkEmployerRole from "../../utils/checkEmployerRole.js";
import Job from "../../models/posting.js";
import Proposal from "../../models/proposal.js";

const cancelAcceptedProposal = express.Router();

cancelAcceptedProposal.post("/cancelAcceptedProposal/:jobId/:proposalId",verifyToken,checkEmployerRole, async (req,res) => {
    const {jobId, proposalId} = req.params;
    const {user} = req.user;

    if(!user) {
        return res.status(400).json({
            message : "Unauthorized, please login"
        })
    }

    try {
        const job = await Job.findOne({_id:jobId, employer: user})

        if(!job) {
            return res.status(404).json({
                message:"Job not found"
            })
        }

        const proposal = await Proposal.findOne({_id: proposalId, job: jobId})

        if(!proposal || proposal.status !== "accepted") {
            return res.status(404).json({
                message: "This proposal was not accepted"
            })
        }

        proposal.status = "pending",
        await proposal.save();

        job.status = "open"
        await job.save();

        await Proposal.updateMany({
            job:jobId, status:"rejected"
        },{
            status: "pending"
        })

        return res.status(200).json({
            message: "Acceptance cancelled. The job is now open for new proposals"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

export default cancelAcceptedProposal;