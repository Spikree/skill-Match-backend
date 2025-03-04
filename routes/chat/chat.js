import User from "../../models/user";
import Message from "../../models/chat";
import express from "express"
import verifyToken from "../../utils/verifyToken";

const message = express.Router();

message.get("/getMessages/:id", verifyToken,async(req,res) => {
    const {id: userToChatId} = req.params;
    const myId = req.user._id;

    try {
        const messages = await Message.find({
            $or: [
                {
                    senderId: myId,
                    receiverId: userToChatId,
                },
                {
                    senderId: userToChatId,
                    receiverId: myId
                }
            ]
        });

        return res.status(200).json({
            message: "Fetched all messages",
            messages
        })
    } catch (error) {
        console.log("Error in chat, get messages")
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

message.post("/sendMessage/:id", verifyToken, async (req,res) => {
    const {text} = req.body;
    const {id: receiverId} = req.body;
    const senderId = req.user._id;

    try {
        const newMessage = new Message({
            senderId,
            receiverId,
            text
        })

        await newMessage.save();

        return res.status(201).json({
            message: "Message sent sucessfully",
            newMessage
        })
    } catch (error) {
        console.log("Error in send message controller");
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

export default message