import User from "../../models/user.js";
import Message from "../../models/chat.js";
import express from "express"
import verifyToken from "../../utils/verifyToken.js";
import { io, users } from "../../utils/socket.js";

const message = express.Router();

message.get("/getMessages/:id", verifyToken, async (req, res) => {
    const {id: userToChatId} = req.params;
    const myId = req.user.user._id;

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
        }).sort({ createdAt: 1 }); // Sort messages chronologically

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
    const {id: receiverId} = req.params;
    const senderId = req.user.user._id
    
    try {
        // Create a unique chat identifier
        const chatId = [senderId, receiverId].sort().join('_');

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            chatId // Add this field to your Message model
        })

        await newMessage.save();

        // Emit to the specific chat room
        const receiverSockets = users.get(receiverId);
        if (receiverSockets) {
            receiverSockets.forEach((socketId) => {
                io.to(socketId).emit("newMessage", {
                    ...newMessage.toObject(),
                    chatId // Include chatId in the emitted message
                });
            });
        }

        return res.status(201).json({
            message: "Message sent successfully",
            newMessage
        })
    } catch (error) {
        console.log("Error in send message controller", error);
      
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

export default message