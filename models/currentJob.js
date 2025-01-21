import mongoose from "mongoose";
const schema = mongoose.Schema

const currentJobSchema = schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    jobId: {type: mongoose.Schema.Types.ObjectId, ref:"Job", required: true},
    jobTitle: {type: String, required: true},
    jobDescription: {type: String, required: true},
    employer: {type: String, required: true},
    payCheck: {type: String, required: true}
})

export default mongoose.model("CurrentJob", currentJobSchema);