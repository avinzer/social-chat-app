const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// Get messages between two users
router.get('/:userId', auth, async (req, res) => {
  try {
    console.log('Fetching messages between:', { user1: req.user.userId, user2: req.params.userId });
    
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user.userId }
      ]
    })
    .populate('sender', 'username profileImage _id')
    .populate('recipient', 'username profileImage _id')
    .sort({ createdAt: 1 });
    
    console.log('Messages found:', messages.length);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating message:', req.body);
    
    const message = new Message({
      sender: req.user.userId,
      recipient: req.body.recipient,
      content: req.body.content
    });
    
    await message.save();
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username profileImage _id')
      .populate('recipient', 'username profileImage _id');

    console.log('Message created:', populatedMessage);
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

module.exports = router; 