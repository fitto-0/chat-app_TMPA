const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { getIO } = require('../socket/socket');

exports.sendMessage = async (req, res) => {
  try {
    const { contenu } = req.body;
    const clientId = req.user.id;

    let conversation = await Conversation.findOne({
      clientId,
      status: { $in: ['pending', 'active'] }
    });

    if (!conversation) {
      conversation = await Conversation.create({ clientId });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: clientId,
      contenu
    });

    if (conversation.agentId) {
      getIO().to(conversation.agentId.toString()).emit('newMessage', {
        message,
        conversationId: conversation._id
      });
    } else {
      getIO().emit('newConversation', {
        conversation,
        message
      });
    }

    res.status(201).json({ message, conversation });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate('clientId', 'nom email')
      .populate('agentId', 'nom email')
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'nom role')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.replyMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { contenu } = req.body;
    const agentId = req.user.id;

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { agentId, status: 'active' },
      { new: true }
    );

    const message = await Message.create({
      conversationId,
      senderId: agentId,
      contenu
    });

    getIO().to(conversation.clientId.toString()).emit('newMessage', {
      message,
      conversationId
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

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { status: 'closed', closedAt: new Date() },
      { new: true }
    );

    getIO().to(conversation.clientId.toString()).emit('conversationClosed', {
      conversationId
    });

    res.status(200).json({ message: 'Conversation fermée' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};