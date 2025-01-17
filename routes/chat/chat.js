import express, { Router } from "express";
import Chat from "../../models/chat";
import user from "../../models/user";
import verifyToken from "../../utils/verifyToken";

const chatRouter = express.Router();

chatRouter.post('/create', verifyToken, async(req,res) => {
    try {
        const {participantId} = req.body;
        const {user} = req.user

        const existingChat = await Chat.findOne({
            participants: {$all : [user._id, participantId]}
        })

        if(existingChat) {
            return res.status(200).json(existingChat)
        }

        const newChat = new Chat({
            participants: [user._id, participantId],
            messages: []
        });

        await newChat.save();
        res.status(201).json(newChat);
    } catch (error) {
        res.status(500).json({ message: "Error creating chat, internal server error", error: error.message });
    }
})

chatRouter.get("/:chatId", verifyToken, async(req,res) => {
    try {
        const {chatId} = req.params;
        const {user} = req.user;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        }).populate('participants', 'name email');

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ message: "Error fetching chat, Internal server error", error: error.message });
    }
})

export default chatRouter;