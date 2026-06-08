const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { getIO } = require('../socket/socket');

const emitToUser = (userId, event, payload) => {
  const io = getIO();
  if (!io || !userId) return;
  io.to(`user:${userId.toString()}`).emit(event, payload);
};

const emitToAgents = (event, payload) => {
  const io = getIO();
  if (!io) return;
  io.to('agents').emit(event, payload);
};

const emitToConversation = (conversationId, event, payload) => {
  const io = getIO();
  if (!io) return;
  io.to(`conversation:${conversationId.toString()}`).emit(event, payload);
};

const updateConversationAfterMessage = async (conversation, message) => {
  conversation.lastMessage = message.contenu;
  conversation.status = conversation.agentId ? 'active' : conversation.status;
  await conversation.save();
};

exports.sendMessage = async (req, res) => {
  try {
    const { contenu, subject, priority } = req.body;
    const clientId = req.user.id;

    let conversation = await Conversation.findOne({
      clientId,
      status: { $in: ['pending', 'active'] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        clientId,
        subject: subject || 'Support request',
        priority: priority || 'normal',
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: clientId,
      contenu,
    });

    await updateConversationAfterMessage(conversation, message);

    if (conversation.agentId) {
      emitToUser(conversation.agentId, 'newMessage', {
        message,
        conversationId: conversation._id,
      });
    } else {
      emitToAgents('newConversation', {
        conversation,
        message,
      });
    }

    res.status(201).json({ message, conversation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let filter = {};
    if (role === 'client') {
      filter = { clientId: userId };
    } else if (role === 'agent') {
      filter = { status: { $in: ['pending', 'active', 'closed'] } };
    }

    const conversations = await Conversation.find(filter)
      .populate('clientId', 'nom email role')
      .populate('agentId', 'nom email role')
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable' });
    }

    if (role === 'client' && conversation.clientId.toString() !== userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (
      role === 'agent' &&
      conversation.agentId &&
      conversation.agentId.toString() !== userId &&
      conversation.status === 'active'
    ) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'nom role')
      .sort({ createdAt: 1 });

    res.status(200).json({ conversation, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const agentId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable' });
    }

    if (conversation.status === 'closed') {
      return res.status(400).json({ message: 'Conversation déjà fermée' });
    }

    if (conversation.agentId) {
      return res.status(400).json({ message: 'Conversation déjà assignée' });
    }

    conversation.agentId = agentId;
    conversation.status = 'active';
    await conversation.save();

    emitToUser(agentId, 'conversationAssigned', { conversation });
    emitToAgents('conversationAssigned', { conversation });

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.replyMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { contenu } = req.body;
    const agentId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable' });
    }

    if (conversation.status === 'closed') {
      return res.status(400).json({ message: 'Conversation fermée' });
    }

    if (!conversation.agentId) {
      conversation.agentId = agentId;
    }

    if (
      conversation.agentId &&
      conversation.agentId.toString() !== agentId &&
      req.user.role === 'agent'
    ) {
      return res.status(403).json({ message: 'Conversation assignée à un autre agent' });
    }

    conversation.status = 'active';
    await conversation.save();

    const message = await Message.create({
      conversationId,
      senderId: agentId,
      contenu,
    });

    await updateConversationAfterMessage(conversation, message);
    emitToUser(conversation.clientId, 'newMessage', {
      message,
      conversationId,
    });
    emitToConversation(conversationId, 'conversationUpdated', { conversation });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.closeConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable' });
    }

    if (conversation.status === 'closed') {
      return res.status(400).json({ message: 'Conversation déjà fermée' });
    }

    conversation.status = 'closed';
    conversation.closedAt = new Date();
    await conversation.save();

    emitToUser(conversation.clientId, 'conversationClosed', { conversationId });
    if (conversation.agentId) {
      emitToUser(conversation.agentId, 'conversationClosed', { conversationId });
    }

    res.status(200).json({ message: 'Conversation fermée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
