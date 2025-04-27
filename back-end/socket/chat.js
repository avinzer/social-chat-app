const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const setupWebSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173", // Your frontend URL
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, 'your-secret-key');
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.id);

    // Join personal room
    socket.join(socket.user.id);

    // Handle private messages
    socket.on('private-message', async (data) => {
      const message = {
        from: socket.user.id,
        to: data.to,
        content: data.content,
        timestamp: new Date()
      };
      
      await db.insert('messages', message);
      
      // Send to recipient and sender
      io.to(data.to).emit('new-message', message);
      socket.emit('message-sent', message);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user.id);
    });
  });

  return io;
};

module.exports = setupWebSocket; 