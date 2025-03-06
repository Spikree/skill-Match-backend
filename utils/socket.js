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

// Store individual chat connections
const chatConnections = new Map();
const activeUsers = new Set();




io.on("connection", (socket) => {
    console.log(`A user connected: ${socket.id}`);

    function getUserIdFromSocket(socket) {
        // Example: Assuming user ID is stored in socket's handshake
        return socket.userId || socket.handshake.auth.userId || null;
    }

    socket.on("join", (userId) => {
        if (!userId) return;

        // Manage user's socket connections
        if (!users.has(userId)) {
            users.set(userId, new Set());
        }
        users.get(userId).add(socket.id);

        console.log(`User ${userId} joined with socket ID: ${socket.id}`);
    });

    socket.on("joinChat", (chatId) => {
        // Join a specific chat room
        socket.join(chatId);
        console.log(`user with Socket id ${socket.id} joined chat room: ${chatId}`);
    });

    socket.on("setActiveStatus", (userId) => {
        activeUsers.add(userId);

        io.emit("userActiveStatus", {
            userId,
            isActive: true
        })
    })

    socket.on("typing", (data) => {
        const {senderId, receiverId, chatId } = data;

        const receiverSockets = users.get(receiverId);
        if(receiverSockets) {
            receiverSockets.forEach((socketId) => {
                io.to(socketId).emit("userTyping", {
                    senderId,
                    isTyping: true,
                    chatId
                });
            });
        }
    });

    socket.on("stopTyping" , (data) => {
        const { senderId, receiverId, chatId } = data;
        const receiverSockets = users.get(receiverId);
        if (receiverSockets) {
            receiverSockets.forEach((socketId) => {
                io.to(socketId).emit("userTyping", {
                    senderId,
                    isTyping: false,
                    chatId
                });
            });
        }
    })
    

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

        const userId = getUserIdFromSocket(socket);
        if(userId) {
            activeUsers.delete(userId)

            io.emit("userActiveStatus", {
                userId,
                isActive: false
            })
        }

        console.log(`User ${disconnectedUserId || "Unknown"} disconnected (Socket: ${socket.id})`);
    });
});

export { io, server, app, users };