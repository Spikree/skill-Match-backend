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

// Store active users
const activeUsers = new Set();

// Store individual chat connections
const chatConnections = new Map();

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);
  
  // Store userId in socket object for easy access later
  let currentUserId = null;

  socket.on("join", (userId) => {
    if (!userId) return;
    
    // Store userId in socket object
    currentUserId = userId;
    socket.userId = userId;

    // Manage user's socket connections
    if (!users.has(userId)) {
      users.set(userId, new Set());
    }
    users.get(userId).add(socket.id);

    console.log(`User ${userId} joined with socket ID: ${socket.id}`);
    
    // Set user as active immediately on join
    activeUsers.add(userId);
    
    // Broadcast to all users that this user is now active
    broadcastUserStatus(userId, true);
    
    // Send this user the status of all other active users
    sendAllActiveStatusToUser(socket);
  });

  socket.on("joinChat", (chatId) => {
    // Join a specific chat room
    socket.join(chatId);
    console.log(`user with Socket id ${socket.id} joined chat room: ${chatId}`);
  });

  socket.on("setActiveStatus", ({ userId }) => {
    if (!userId) return;
    
    activeUsers.add(userId);
    broadcastUserStatus(userId, true);
  });

  socket.on("typing", (data) => {
    const { senderId, receiverId, chatId } = data;

    const receiverSockets = users.get(receiverId);
    if (receiverSockets) {
      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit("userTyping", {
          senderId,
          isTyping: true,
          chatId
        });
      });
    }
  });

  socket.on("stopTyping", (data) => {
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
  });

  socket.on("disconnect", () => {
    // Use the stored userId from the socket object
    const userId = socket.userId || currentUserId;
    
    if (userId) {
      // Remove this socket from the user's socket set
      const userSockets = users.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        
        // If the user has no more active sockets, mark them as inactive
        if (userSockets.size === 0) {
          users.delete(userId);
          activeUsers.delete(userId);
          
          // Broadcast to all users that this user is now inactive
          broadcastUserStatus(userId, false);
        }
      }
    }

    console.log(`User ${userId || "Unknown"} disconnected (Socket: ${socket.id})`);
  });
  
  // Helper function to broadcast user status to all connected users
  function broadcastUserStatus(userId, isActive) {
    io.emit("userActiveStatus", {
      userId,
      isActive
    });
  }
  
  // Helper function to send all active users to a newly connected user
  function sendAllActiveStatusToUser(socket) {
    activeUsers.forEach(activeUserId => {
      socket.emit("userActiveStatus", {
        userId: activeUserId,
        isActive: true
      });
    });
  }
});



export { io, server, app, users };