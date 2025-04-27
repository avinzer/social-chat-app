const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['friend_request', 'friend_request_response', 'group_invite', 'post_like', 'post_comment', 'group_join_request'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  content: {
    type: String,
    required: true
  },
  friendRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Friend'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema); 