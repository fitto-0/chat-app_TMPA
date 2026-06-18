const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const permit = require("../middleware/role.middleware");
const {
  sendMessage,
  getConversations,
  getMessages,
  assignConversation,
  replyMessage,
  closeConversation,
  markMessagesAsRead,
} = require("../controllers/message.controller");

// Client routes
router.post("/send", auth, permit("client"), sendMessage);
router.get("/conversations", auth, getConversations);
router.get("/conversations/:conversationId", auth, getMessages);
router.put(
  "/conversations/:conversationId/read",
  auth,
  markMessagesAsRead,
);

// Agent routes
router.post(
  "/conversations/:conversationId/assign",
  auth,
  permit("agent", "admin"),
  assignConversation,
);
router.post(
  "/conversations/:conversationId/reply",
  auth,
  permit("agent", "admin"),
  replyMessage,
);
router.put(
  "/conversations/:conversationId/close",
  auth,
  permit("agent", "admin"),
  closeConversation,
);

module.exports = router;
