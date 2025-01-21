import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/connectDb.js";
import auth from "./routes/auth.js";
import profile from "./routes/usersettings/profile.js";
import resetpassword from "./routes/usersettings/resetpassword.js";
import { createJob } from "./routes/createJob/createJob.js";
import submitProposal from "./routes/applyJob/applyJob.js";
import { getJobProposals } from "./routes/fetchJobProposals/getProposals.js";
import getJobs from "./routes/fetchJobs/fetchjobs.js";
import saveJob from "./routes/saveJobListing/saveJobListing.js";
import acceptProposal from "./routes/acceptProposal/acceptProposal.js";
import cancelAcceptedProposal from "./routes/cancelAcceptedProposal/cancelAcceptedProposal.js";
import cors from "cors";
import finished from "./routes/finishedJobs/finishedJob.js";

dotenv.config();

connectDb();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", auth);
app.use("/profile", profile);
app.use("/profile", resetpassword);
app.use("/job", createJob);
app.use("/proposal", submitProposal);
app.use("/job", getJobProposals);
app.use("/job", getJobs);
app.use("/job", saveJob);
app.use("/job", acceptProposal);
app.use("/job", cancelAcceptedProposal);
app.use("/job", finished);

app.use("/", (req, res) => {
  res.json("backend is working");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`port running on http://localhost:${PORT}`);
});
