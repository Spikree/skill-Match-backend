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
import getOnGoingJob from "./routes/fetchJobs/fetchOnGoingJobs.js";
import fetchCreatedJobs from "./routes/fetchJobs/fetchCreatedJobs.js";
import review from "./routes/review/review.js";
import visitProfile from "./routes/usersettings/visitProfileDetails.js";
import deleteJob from "./routes/deleteJob/deleteJob.js";
import message from "./routes/chat/chat.js";
import { app, server } from "./utils/socket.js";

dotenv.config();

connectDb();

app.use(cors({
  origin: "*",
}));
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
app.use("/job", getOnGoingJob);
app.use("/job", fetchCreatedJobs);
app.use("/review", review);
app.use("/profile",visitProfile);
app.use("/job", deleteJob);
app.use("/message",message);

app.use("/", (req, res) => {
  res.json("backend is working");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`port running on http://localhost:${PORT}`);
});
