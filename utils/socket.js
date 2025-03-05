import express from "express";
import { createServer } from "http"; 
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Ensure frontend URL matches
        methods: ["GET", "POST"]
    }
});

// Store userId -> Set of socketIds (to handle multiple logins)
const users = new Map();

io.on("connection", (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on("join", (userId) => {
        if (!userId) return;

        if (!users.has(userId)) {
            users.set(userId, new Set());
        }
        users.get(userId).add(socket.id);

        console.log(`User ${userId} joined with socket ID: ${socket.id}`);
    });

    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        if (!receiverId || !text) return;

        const receiverSockets = users.get(receiverId);
        
        if (receiverSockets) {
            receiverSockets.forEach((socketId) => {
                io.to(socketId).emit("newMessage", { senderId, text });
            });
            console.log(`Message sent to ${receiverId}:`, text);
        } else {
            console.log(`User ${receiverId} is offline or not connected.`);
        }
    });

    socket.on("disconnect", () => {
        let disconnectedUserId = null;

        for (const [userId, socketSet] of users.entries()) {
            if (socketSet.has(socket.id)) {
                socketSet.delete(socket.id);
                disconnectedUserId = userId;

                if (socketSet.size === 0) {
                    users.delete(userId);
                }
                break;
            }
        }

        console.log(`User ${disconnectedUserId || "Unknown"} disconnected (Socket: ${socket.id})`);
    });
});

export { io, server, app, users };
