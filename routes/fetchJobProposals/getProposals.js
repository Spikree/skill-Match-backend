import express from "express";
import Proposal from "../../models/proposal.js";
import verifyToken from "../../utils/verifyToken.js";
import checkEmployerRole from "../../utils/checkEmployerRole.js";
const getJobProposals = express.Router();

getJobProposals.get(
  "/getproposals/:id",
  verifyToken,
  checkEmployerRole,
  async (req, res) => {
    const {id} = req.params; // job id
     try {
        const proposals = await Proposal.find({job: id})
        
        return res.status(200).json({
            message: "fetched all proposals sucessfully",
            proposals
        })
     } catch (error) {
        return res.status(400).json({
            message: "Internal server error"
        })
     }
  }
);

export {getJobProposals}
