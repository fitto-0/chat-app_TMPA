const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
  sendMessage,
  getConversations,
  getMessages,
  replyMessage,
  closeConversation,
} = require("../controllers/message.controller");

// Client routes
router.post("/send", auth, sendMessage);

// Agent routes
router.get("/conversations", auth, getConversations);
router.get("/conversations/:conversationId", auth, getMessages);
router.post("/conversations/:conversationId/reply", auth, replyMessage);
router.put("/conversations/:conversationId/close", auth, closeConversation);

module.exports = router;
