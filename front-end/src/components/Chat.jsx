/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import '../style/_chat.scss';

const Chat = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friends, setFriends] = useState([]);
  const messagesEndRef = useRef(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser) {
        setMessageLoading(true);
        setMessageError(null);
        try {
          console.log('Fetching messages for user:', selectedUser._id);
          const response = await api.get(`/api/messages/${selectedUser._id}`);
          console.log('Messages received:', response.data);
          setMessages(response.data);
        } catch (err) {
          console.error('Error fetching messages:', err);
          setMessageError('Failed to load messages');
        } finally {
          setMessageLoading(false);
        }
      } else {
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, notificationsRes, friendsRes] = await Promise.all([
          api.get('/api/friends/users'),
          api.get('/api/notifications'),
          api.get('/api/friends')
        ]);
        setUsers(usersRes.data);
        setNotifications(notificationsRes.data);
        setFriends(friendsRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFriendRequest = async (notification, status = 'accepted') => {
    try {
      if (!notification.friendRequestId) {
        console.error('No friend request ID found in notification');
        return;
      }

      console.log('Handling friend request:', { notification, status });

      // Update friend request status
      await api.put(`/api/friends/request/${notification.friendRequestId}`, { 
        status: status 
      });
      
      // Delete the notification
      await api.delete(`/api/notifications/${notification._id}`);
      
      // Refresh all data
      const [notificationsRes, usersRes, friendsRes] = await Promise.all([
        api.get('/api/notifications'),
        api.get('/api/friends/users'),
        api.get('/api/friends')
      ]);
      
      setNotifications(notificationsRes.data);
      setUsers(usersRes.data);
      setFriends(friendsRes.data);
    } catch (err) {
      console.error('Error handling friend request:', err);
      setError('Failed to handle friend request');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      console.log('Sending message:', {
        recipient: selectedUser._id,
        content: newMessage
      });

      const response = await api.post('/api/messages', {
        recipient: selectedUser._id,
        content: newMessage.trim()
      });

      console.log('Message sent:', response.data);
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await api.post(`/api/friends/request/${userId}`);
      // Refresh users list and notifications
      const [usersRes, notificationsRes] = await Promise.all([
        api.get('/api/friends/users'),
        api.get('/api/notifications')
      ]);
      setUsers(usersRes.data);
      setNotifications(notificationsRes.data);
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError('Failed to send friend request');
    }
  };

  if (loading) return <div className="chat-loading">Loading...</div>;
  if (error) return <div className="chat-error">{error}</div>;

  return (
    <div className="chat-container">
      <div className="users-list">
        <h2>Friends & Users</h2>
        {users.map((otherUser) => (
          <div 
            key={otherUser._id} 
            className={`user-item ${selectedUser?._id === otherUser._id ? 'active' : ''}`}
            onClick={() => {
              if (friends.some(friend => friend._id === otherUser._id)) {
                setSelectedUser(otherUser);
              }
            }}
          >
            <div className="user-info">
              {otherUser.profileImage ? (
                <img src={`http://localhost:5000${otherUser.profileImage}`} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {otherUser.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span>{otherUser.username}</span>
            </div>
            {!otherUser.friendshipStatus && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  sendFriendRequest(otherUser._id);
                }}
                className="add-friend-btn"
              >
                Add Friend
              </button>
            )}
            {otherUser.friendshipStatus === 'pending' && (
              <div className="pending-status">
                {otherUser.isRequester ? (
                  'Request Sent'
                ) : (
                  <div className="friend-request-actions">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const notification = notifications.find(
                          n => n.type === 'friend_request' && n.sender._id === otherUser._id
                        );
                        if (notification) {
                          handleFriendRequest(notification);
                        }
                      }}
                      className="accept-btn"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const notification = notifications.find(
                          n => n.type === 'friend_request' && n.sender._id === otherUser._id
                        );
                        if (notification) {
                          handleFriendRequest(notification, 'rejected');
                        }
                      }}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedUser ? (
        <div className="chat-messages">
          <div className="messages-header">
            <h3>Chat with {selectedUser.username}</h3>
          </div>
          
          <div className="message-list">
            {messageLoading ? (
              <div className="messages-loading">Loading messages...</div>
            ) : messageError ? (
              <div className="messages-error">{messageError}</div>
            ) : messages.length === 0 ? (
              <div className="no-messages">No messages yet. Start a conversation!</div>
            ) : (
              <div className="messages-wrapper">
                {messages.map((message) => (
                  <div 
                    key={message._id}
                    className={`message ${message.sender._id === user.id ? 'sent' : 'received'}`}
                  >
                    <div className="message-sender">
                      {message.sender.username}
                    </div>
                    <div className="message-content">
                      {message.content}
                    </div>
                    <div className="message-time">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="message-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit" disabled={!newMessage.trim()}>
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="no-chat-selected">
          Select a friend to start chatting
        </div>
      )}

      <div className="notifications-list">
        <h2>Notifications</h2>
        {notifications.map((notification) => (
          <div key={notification._id} className="notification-item">
            <div className="notification-content">
              <strong>{notification.sender.username}</strong> {notification.content}
            </div>
            {notification.type === 'friend_request' && !notification.read && (
              <div className="notification-actions">
                <button onClick={() => handleFriendRequest(notification, 'accepted')}>
                  Accept
                </button>
                <button onClick={() => handleFriendRequest(notification, 'rejected')}>
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat; 