const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Friend = require('../models/Friend');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all friends
router.get('/', auth, async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { requester: req.user.userId, status: 'accepted' },
        { recipient: req.user.userId, status: 'accepted' }
      ]
    }).populate('requester recipient', 'username profileImage');
    
    // Transform to simple user objects
    const friendUsers = friends.map(friend => {
      const otherUser = friend.requester._id.toString() === req.user.userId ? 
        friend.recipient : friend.requester;
      return otherUser;
    });

    res.json(friendUsers);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Error fetching friends' });
  }
});

// Get all users (except current user)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } })
      .select('username profileImage');
    
    // Get existing friend relationships
    const friendships = await Friend.find({
      $or: [
        { requester: req.user.userId },
        { recipient: req.user.userId }
      ]
    });

    // Add friendship status to users
    const usersWithStatus = users.map(user => {
      const friendship = friendships.find(f => 
        f.requester.toString() === user._id.toString() || 
        f.recipient.toString() === user._id.toString()
      );

      return {
        ...user.toObject(),
        friendshipStatus: friendship ? friendship.status : null,
        isRequester: friendship?.requester.toString() === req.user.userId
      };
    });

    res.json(usersWithStatus);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Send friend request
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const recipientId = req.params.userId;

    // Check if request already exists
    const existingRequest = await Friend.findOne({
      $or: [
        { requester: req.user.userId, recipient: recipientId },
        { requester: recipientId, recipient: req.user.userId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    // Create friend request
    const friendRequest = new Friend({
      requester: req.user.userId,
      recipient: recipientId
    });
    await friendRequest.save();

    // Create notification with friend request ID
    const notification = new Notification({
      recipient: recipientId,
      sender: req.user.userId,
      type: 'friend_request',
      content: 'sent you a friend request',
      friendRequestId: friendRequest._id
    });
    await notification.save();

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Error sending friend request' });
  }
});

// Accept/Reject friend request
router.put('/request/:requestId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    console.log('Handling friend request:', { requestId: req.params.requestId, status });
    
    const request = await Friend.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Check if user is the recipient
    if (request.recipient.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update request status
    request.status = status;
    await request.save();

    // Create notification for requester
    const notification = new Notification({
      recipient: request.requester,
      sender: req.user.userId,
      type: 'friend_request',
      content: `has ${status} your friend request`,
      read: false,
      friendRequestId: request._id
    });
    await notification.save();

    // Get updated friend data with populated fields
    const updatedRequest = await Friend.findById(req.params.requestId)
      .populate('requester', 'username profileImage')
      .populate('recipient', 'username profileImage');

    // Get updated friends list for response
    const friends = await Friend.find({
      $or: [
        { requester: req.user.userId, status: 'accepted' },
        { recipient: req.user.userId, status: 'accepted' }
      ]
    }).populate('requester recipient', 'username profileImage');

    res.json({ 
      message: `Friend request ${status}`,
      request: updatedRequest,
      friends: friends
    });
  } catch (error) {
    console.error('Error updating friend request:', error);
    res.status(500).json({ message: 'Error updating friend request' });
  }
});

module.exports = router; 