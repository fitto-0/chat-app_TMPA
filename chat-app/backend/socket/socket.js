const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      return next();
    } catch (error) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket) => {
    const { id, role } = socket.user;
    console.log("Socket connected for user:", id, "role:", role);

    await User.findByIdAndUpdate(id, { isOnline: true });

    socket.join(`user:${id}`);
    if (["agent", "admin"].includes(role)) {
      socket.join("agents");
    }

    socket.emit("connected", { userId: id, role });

    socket.on("joinConversation", (conversationId) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on("leaveConversation", (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    socket.on("disconnect", async () => {
      console.log("Socket disconnected for user:", id);
      await User.findByIdAndUpdate(id, { isOnline: false });
    });
  });
};

const getIO = () => io;

module.exports = { initSocket, getIO };
