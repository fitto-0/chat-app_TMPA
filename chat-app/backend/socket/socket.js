const socketIO = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    socket.on('sendMessage', (data) => {
      io.to(data.agentId).emit('newMessage', data);
    });

    socket.on('replyMessage', (data) => {
      io.to(data.clientId).emit('newMessage', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

const getIO = () => io;

module.exports = { initSocket, getIO };