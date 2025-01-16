import express from "express"
import Job from "../../models/posting.js"
import Proposal from "../../models/proposal.js"
import verifyToken from "../../utils/verifyToken.js"

const submitProposal = express.Router()

submitProposal.post("/submit/:id",verifyToken, async (req,res) => {
    const {id} = req.params; // job id
    const { user } = req.user;
    const {bidAmount,coverLetter} = req.body;

    try {
        const isJob = await Job.findById(id)

        if(!isJob) {
            return res.status(400).json({
                message: "Job not found",
            })
        }

        const proposal = new Proposal({
            job: id,
            freelancer: user,
            bidAmount:bidAmount,
            coverLetter: coverLetter,
        })

        await proposal.save();

        res.status(200).json({
            message: "Proposal submitted successfully",
            proposal
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: 'Internal server error' });
    }
});

export {submitProposal}
