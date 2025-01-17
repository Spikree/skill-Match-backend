import mongoose from "mongoose";
const schema = mongoose.Schema

const chatSchema = schema({
    jobId: {type:mongoose.Schema.Types.ObjectId, ref:"Job", required: true},
    participants: [{type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}],
    messages: [{
        sender: {type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
        message: { type: String, required: true },
        sentAt: {type: Date, default: Date.now}
    }],
    createdAt:{type: Date, default: Date.now}
});

export default mongoose.model("Chat", chatSchema);