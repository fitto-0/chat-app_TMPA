const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// Client كيبعت رسالة (تتخلق conversation تلقائياً)
exports.sendMessage = async (req, res) => {
  try {
    const { contenu } = req.body;
    const clientId = req.user.id;

    // شوف واش كاين conversation active
    let conversation = await Conversation.findOne({
      clientId,
      status: { $in: ["pending", "active"] },
    });

    // إلا ماكانش دير واحدة جديدة
    if (!conversation) {
      conversation = await Conversation.create({ clientId });
    }

    // خلق المسج
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: clientId,
      contenu,
    });

    res.status(201).json({ message, conversation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Agent كيشوف كل conversations
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate("clientId", "nom email")
      .populate("agentId", "nom email")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Agent كيشوف رسائل conversation معينة
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate("senderId", "nom role")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Agent كيجاوب
exports.replyMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { contenu } = req.body;
    const agentId = req.user.id;

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      agentId,
      status: "active",
    });

    // خلق المسج
    const message = await Message.create({
      conversationId,
      senderId: agentId,
      contenu,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Agent كيسد conversation
exports.closeConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Conversation.findByIdAndUpdate(conversationId, {
      status: "closed",
      closedAt: new Date(),
    });

    res.status(200).json({ message: "Conversation fermée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
